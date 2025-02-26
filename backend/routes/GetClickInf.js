const { turso } = require("../config");

const GetClickInf = async (req, res) => {
  try {
    const short_link = req.short_link;

    const LinkID = await turso.execute({
      sql: `SELECT id FROM links WHERE short_link = :short_link;`,
      args: { short_link: short_link },
    });
    if (LinkID.rows.length === 0) {
      return res.json({ message: "Short link not found", success: false });
    }

    const result = await turso.execute({
      sql: `SELECT * FROM clicks WHERE link_id = :link_id;`,
      args: { link_id: LinkID.rows[0].id },
    });

    if (result.rows.length === 0) {
      return res.json({ message: "noClick", success: true });
    }

    return res.json({ message: result.rows, success: true });
  } catch (e) {
    console.error(e);
    return res.json({
      message: "Server error, please contact admin.",
      success: false,
    });
  }
};

module.exports = GetClickInf;
