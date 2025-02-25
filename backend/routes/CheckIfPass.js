const { turso } = require("../config");

const CheckIfPass = async (req, res) => {
  try {
    const short_link = req.short_link;

    const result = await turso.execute({
      sql: `SELECT password FROM links WHERE short_link = :short_link;`,
      args: { short_link: short_link },
    });

    if (result.rows.length === 0) {
      return res.json({ message: "Short link not found", success: false });
    }

    const hasPassword = !!result.rows[0].password;

    return res.json({ success: true, hasPassword });
  } catch (e) {
    console.error(e);
    return res.json({
      message: "Server error, please contact admin.",
      success: false,
    });
  }
};

module.exports = CheckIfPass;
