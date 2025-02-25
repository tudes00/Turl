const { turso } = require("../config");

const DeleteLink = async (req, res) => {
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

    const short_link = req.short_link;

    const LinkID = await turso.execute({
      sql: `SELECT id FROM links WHERE short_link = :short_link;`,
      args: { short_link: short_link },
    });
    if (LinkID.rows.length === 0) {
      return res.json({ message: "Short link not found", success: false });
    }

    await turso.execute({
      sql: `DELETE FROM links WHERE user_id = :user_id AND id=:Link_ID;`,
      args: { user_id: userId, Link_ID: LinkID.rows[0].id },
    });
    return res.json({ message: "Link deleted successfully", success: true });
  } catch (e) {
    console.error(e);
    return res.json({
      message: "Server error, please contact admin.",
      success: false,
    });
  }
};

module.exports = DeleteLink;
