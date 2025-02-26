const { turso } = require("../config");

const blockedIps = ["127.0.0.1", "localhost"];

const clickThresholds = [1, 5, 10, 20, 50, 100, 200, 500, 1000];

const AddClick = async (req, res) => {
  try {
    let Country = "";
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    //Pour local test, supprimer en prod:
    if (ip === "::1") {
      ip = generateRandomIP();
    }

    function generateRandomIP() {
      const randomIP = Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * 256))
        .join(".");
      return randomIP;
    }

    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }

    if (blockedIps.includes(ip)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    const validIP =
      /^(25[0-5]|2[0-4]\d|1\d\d|\d{1,2})\.(25[0-5]|2[0-4]\d|1\d\d|\d{1,2})\.(25[0-5]|2[0-4]\d|1\d\d|\d{1,2})\.(25[0-5]|2[0-4]\d|1\d\d|\d{1,2})$/;
    if (!validIP.test(ip)) {
      return res.json({ message: "Invalid IP address", success: false });
    }

    const short_link = req.short_link;

    const link = await turso.execute({
      sql: `SELECT original_url , id  FROM links WHERE short_link =:short_link`,
      args: { short_link: short_link },
    });
    if (link.rows.length === 0) {
      return res.json({ message: "Short link not found", success: false });
    }

    fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,query`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        Country = data.country || "Unknown";

        turso
          .execute({
            sql: `INSERT INTO clicks (link_id, country) VALUES (:id, :country);`,
            args: { id: link.rows[0].id, country: Country },
          })
          .then((result) => {
            turso
              .execute({
                sql: `SELECT webhook FROM links WHERE id=:id `,
                args: { id: link.rows[0].id },
              })
              .then((result) => {
                const webhook = result.rows[0].webhook;
                if (webhook !== "") {
                  turso
                    .execute({
                      sql: `SELECT COUNT(*) AS count FROM clicks WHERE link_id = :id;`,
                      args: { id: link.rows[0].id },
                    })
                    .then((result) => {
                      if (clickThresholds.includes(result.rows[0].count)) {
                        fetch(webhook, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            username: `/${short_link}`,
                            embeds: [
                              {
                                author: {
                                  name: "🚀 Turl",
                                  url: "https://eturlb.vercel.app/",
                                },
                                title: "🎉 New click milestone reached!",
                                description: `The shortened link **[/${short_link}](https://eturlb.vercel.app/s/${short_link})** has reached a new click milestone! 🎯`,
                                color: 4739732,
                                fields: [
                                  {
                                    name: "🔗 Original Link",
                                    value: `➡️ ${link.rows[0].original_url}`,
                                    inline: true,
                                  },
                                  {
                                    name: "🖱️ Click Count",
                                    value: `➡️ ${result.rows[0].count}`,
                                    inline: true,
                                  },
                                ],
                                footer: {
                                  text: "🔥 Stay tuned for more updates!",
                                  icon_url:
                                    "https://eturlb.vercel.app/iconTurlV1.svg",
                                },
                                timestamp: new Date(),
                              },
                            ],
                          }),
                        })
                          .then((response) => {
                            if (!response.ok) {
                              throw new Error("Error");
                            }
                          })
                          .catch((error) => {
                            console.error("Error:", error);
                          });
                      }
                    });
                }
              });
          });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    return res.json({
      message: "Click added successfully",
      success: true,
    });
  } catch (e) {
    console.error(e);
    return res.json({
      message: "Server error, please contact admin.",
      success: false,
    });
  }
};

module.exports = AddClick;
