const { sqlConnection } = require('../config/db');

const checkRoleAdmin = (req, res, next) => {
    const userId = req.user.id;

    const query = 'SELECT role FROM utilisateur WHERE id = ?';
    sqlConnection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { role } = results[0];

        if (role !== 'admin') {
            return res.status(403).json({ message: `Vous n'êtes pas autorisé a acceder a cette page` });
        }

        next();
    });
};

const checkRoleUser = (req, res, next) => {
    const userId = req.user.id;

    const query = 'SELECT role FROM utilisateur WHERE id = ?';
    sqlConnection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { role } = results[0];

        if (role !== 'utilisateur') {
            return res.status(403).json({ message: `Vous n'êtes pas autorisé a acceder a cette page` });
        }

        next();
    });
};

module.exports = {
    checkRoleAdmin,
    checkRoleUser
};
