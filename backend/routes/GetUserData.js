const { turso } = require("../config");

const GetUserData = async (req, res) => {
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
      sql: `SELECT webhook FROM connections WHERE id = :user_id; `,
      args: { user_id: userId },
    });
    if (result.rows.length > 0) {
      return res.json({ message: result.rows[0], success: true });
    } else {
      return res.json({
        message: "No webhook found",
        success: false,
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

module.exports = GetUserData;
