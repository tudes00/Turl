const { turso } = require("../config");

const DeleteUser = async (req, res) => {
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

    const linkIds = await turso.execute({
      sql: `SELECT id FROM links WHERE user_id = :id;`,
      args: { id: userId },
    });

    if (linkIds.rows.length > 0) {
      const ids = linkIds.rows.map((row) => row.id);

      await turso.execute({
        sql: `DELETE FROM clicks WHERE id IN (${ids.map(() => "?").join(",")})`,
        args: ids,
      });
    }

    await turso.execute({
      sql: `DELETE FROM links WHERE user_id = :id`,
      args: { id: userId },
    });

    await turso.execute({
      sql: `DELETE FROM connections WHERE id = :id`,
      args: { id: userId },
    });

    return res.json({ message: "User deleted successfully", success: true });
  } catch (e) {
    console.error(e);
    return res.json({
      message: "Server error, please contact admin.",
      success: false,
    });
  }
};

module.exports = DeleteUser;
