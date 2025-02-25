const { turso } = require('../config');

const AddUser = async (req, res) => {
    try {
        const token = req.cookies.token;

      const loggedInUser = JSON.parse(atob(token.split(".")[1]))
      const mail = loggedInUser.email;

        if (!mail || !/\S+@\S+\.\S+/.test(mail)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        await turso.execute({
            sql: `INSERT INTO connections (timestamp, mail) 
                    SELECT datetime('now'), :mail
                    WHERE NOT EXISTS (SELECT 1 FROM connections WHERE mail = :mail);`,
            args: { mail: mail },
        });
        console.log("New connection: " + mail);
        res.json({ message: 'Done' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error, please contact admin.' });
    };
};

module.exports = AddUser;