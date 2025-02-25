const { turso } = require("../config");

const GetUrl = async (req, res) => {
  try {
    const loggedInUser = JSON.parse(atob(req.cookies.token.split(".")[1]));
    const mail = loggedInUser.email;

    const loggedIn = await turso.execute({
      sql: `SELECT id FROM connections WHERE mail = :mail;`,
      args: { mail: mail },
    });
    const userId = loggedIn.rows.length > 0 ? loggedIn.rows[0].id : null;
    if (!userId) {
      return res.json({ message: "User not found", success: false });
    }

    const result = await turso.execute({
      sql: `SELECT * FROM links WHERE user_id = :user_id; `,
      args: { user_id: userId },
    });
    if (result.rows.length > 0) {
      return res.json({ message: result.rows, success: true });
    } else {
      return res.json({
        message: "Start creating your first short link",
        success: false,
        start: true,
      });
    }
  } catch (e) {
    console.error(e);
    return res.json({
      message: "Server error, please contact admin.",
      success: false,
    });
  }
};

module.exports = GetUrl;
