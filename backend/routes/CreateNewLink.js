const { turso, hashPassword } = require("../config");

function isValidHttpUrl(Url) {
  try {
    const url = new URL(Url);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
}

const CreateNewLink = async (req, res) => {
  try {
    const loggedInUser = JSON.parse(atob(req.cookies.token.split(".")[1]));
    const mail = loggedInUser.email;

    const short_link = req.short_link;
    const original_url = req.body.original_url;
    const webhook = req.body.webhook;
    const password = req.body.password;

    const webhookRegex =
      /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-z0-9_-]+$/;

    if (!short_link || !original_url) {
      return res.json({ message: "Missing required fields", success: false });
    } else if (
      !isValidHttpUrl(original_url) ||
      (this.webhook && !webhookRegex.test(this.webhook))
    ) {
      return res.json({ message: "Invalid field", success: false });
    }

    const UniqueShortLink = await turso.execute({
      sql: `SELECT COUNT(*) AS count FROM links WHERE short_link = :short_link;`,
      args: { short_link: short_link },
    });
    if (UniqueShortLink.rows[0].count > 0) {
      return res.json({ message: "Short link already exists", success: false });
    }

    const loggedIn = await turso.execute({
      sql: `SELECT id FROM connections WHERE mail = :mail;`,
      args: { mail: mail },
    });
    const userId = loggedIn.rows.length > 0 ? loggedIn.rows[0].id : null;
    if (!userId) {
      return res.json({ message: "User not found", success: false });
    }

    const hashedPassword = password ? hashPassword(password) : null;

    await turso.execute({
      sql: `INSERT INTO links (short_link, original_url, user_id, webhook, password) VALUES (  :short_link, :original_url, :user_id, :webhook, :hashed_password);`,
      args: {
        short_link: short_link,
        original_url: original_url,
        user_id: userId,
        webhook: webhook,
        hashed_password: hashedPassword,
      },
    });

    return res.json({ message: "Link created successfully", success: true });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Server error, please contact admin.", success: false });
  }
};

module.exports = CreateNewLink;
