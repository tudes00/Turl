const { turso } = require("../config");

function isValidHttpUrl(Url) {
  try {
    const url = new URL(Url);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
}

const EditWebhook = async (req, res) => {
  try {
    const loggedInUser = JSON.parse(atob(req.cookies.token.split(".")[1]));
    const mail = loggedInUser.email;

    const webhook = req.body.webhook;
    const webhookRegex =
      /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-z0-9_-]+$/;

    if (webhook && !webhookRegex.test(webhook)) {
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

    await turso.execute({
      sql: `UPDATE connections 
            SET webhook = :webhook
            WHERE id = :user_id;
            `,
      args: {
        user_id: userId,
        webhook: webhook,
      },
    });

    return res.json({ message: "Webhook edited successfully", success: true });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Server error, please contact admin.", success: false });
  }
};

module.exports = EditWebhook;
