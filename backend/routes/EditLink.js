const { turso, hashPassword } = require("../config");

function isValidHttpUrl(Url) {
  try {
    const url = new URL(Url);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
}

const EditLink = async (req, res) => {
  try {
    const loggedInUser = JSON.parse(atob(req.cookies.token.split(".")[1]));
    const mail = loggedInUser.email;

    const short_link = req.short_link;
    const short_link_edit = req.body.short_link_edit;
    const original_url = req.body.original_url;
    const webhook = req.body.webhook;
    const password = req.body.password;

    const shortValidCharacters = /^[a-zA-Z0-9_-]+$/;
    const shortValidLength = /^.{2,20}$/;
    const webhookRegex =
      /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-z0-9_-]+$/;

    if (!short_link || !original_url) {
      return res.json({ message: "Missing required fields", success: false });
    } else if (
      !isValidHttpUrl(original_url) ||
      !shortValidLength.test(short_link_edit) ||
      !shortValidCharacters.test(short_link_edit) ||
      (webhook && !webhookRegex.test(webhook))
    ) {
      return res.json({ message: "Invalid field", success: false });
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
    console.log(
      linkID.rows[0].id,
      original_url,
      short_link_edit,
      userId,
      webhook
    );
    if (linkID.rows.length === 0) {
      return res.json({ message: "Not found", success: false });
    }

    const hashedPassword = password ? hashPassword(password) : null;
    console.log(hashedPassword);

    await turso.execute({
      sql: `UPDATE links 
            SET original_url = :original_url,
                webhook = :webhook,
                short_link = :short_link_edit,
                password = :password
            WHERE user_id = :user_id AND id = :linkID;
            `,
      args: {
        linkID: linkID.rows[0].id,
        original_url: original_url,
        short_link_edit: short_link_edit,
        user_id: userId,
        webhook: webhook,
        password: hashedPassword,
      },
    });

    return res.json({ message: "Link edited successfully", success: true });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Server error, please contact admin.", success: false });
  }
};

module.exports = EditLink;
