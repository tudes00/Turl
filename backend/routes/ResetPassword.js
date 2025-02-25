const { turso, hashPassword } = require("../config");

const ResetPassword = async (req, res) => {
  try {
    const loggedInUser = JSON.parse(atob(req.cookies.token.split(".")[1]));
    const mail = loggedInUser.email;

    const short_link = req.short_link;

    if (!short_link) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const loggedIn = await turso.execute({
      sql: `SELECT id FROM connections WHERE mail = :mail;`,
      args: { mail: mail },
    });
    const userId = loggedIn.rows.length > 0 ? loggedIn.rows[0].id : null;
    if (!userId) {
      return res.json({ message: "User not found", success: false });
    }

    const linkID = await turso.execute({
      sql: `SELECT id FROM links WHERE user_id = :user_id AND short_link = :short_link;`,
      args: { short_link: short_link, user_id: userId },
    });

    if (linkID.rows.length === 0) {
      return res.json({ message: "Not found", success: false });
    }

    await turso.execute({
      sql: `UPDATE links 
            SET password = :password
            WHERE user_id = :user_id AND id = :linkID;
            `,
      args: {
        linkID: linkID.rows[0].id,
        user_id: userId,
        password: null,
      },
    });

    return res.json({
      message: "Password reseted successfully",
      success: true,
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Server error, please contact admin.", success: false });
  }
};

module.exports = ResetPassword;
