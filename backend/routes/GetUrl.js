const { turso, hashPassword, bcrypt } = require("../config");

const GetUrl = async (req, res) => {
  try {
    const short_link = req.short_link;
    const password = req.query.password;

    const result = await turso.execute({
      sql: `SELECT original_url, password FROM links WHERE short_link = :short_link;`,
      args: { short_link: short_link },
    });
    console.log(result.rows);
    if (result.rows.length === 0) {
      return res.json({ message: "Short link not found", success: false });
    }

    if (password && result.rows[0].password) {
      console.log(password);
      const isCorrectPassword = await bcrypt.compare(
        password,
        result.rows[0].password
      );
      if (!isCorrectPassword) {
        return res.json({ message: "Incorrect password", success: false });
      }
    }

    return res.json({ message: result.rows[0].original_url, success: true });
  } catch (e) {
    console.error(e);
    return res.json({
      message: "Server error, please contact admin.",
      success: false,
    });
  }
};

module.exports = GetUrl;
