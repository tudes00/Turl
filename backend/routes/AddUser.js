const { turso } = require("../config");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const addUser = async (req, res) => {
  try {
    const token = req.body.token;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const mail = payload.email;

    if (!mail || !/\S+@\S+\.\S+/.test(mail)) {
      return res.status(401).json({ message: "Invalid email" });
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 3600000,
      partitioned: true,
    });

    await turso.execute({
      sql: `INSERT INTO connections (timestamp, mail) 
            SELECT datetime('now'), :mail
            WHERE NOT EXISTS (SELECT 1 FROM connections WHERE mail = :mail);`,
      args: { mail: mail },
    });

    console.log("New connection: " + mail);
    console.log("Cookie défini:", req.cookies);
    res.json({ message: "Cookie set and user added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error, please contact admin." });
  }
};

module.exports = addUser;
