const { sqlConnection } = require('../config/db');

const checkStatus = (req, res, next) => {
    const userId = req.user.id;

    const query = 'SELECT id_status_seance FROM utilisateur WHERE id = ?';
    sqlConnection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { id_status_seance } = results[0];

        if (id_status_seance) {
            return res.status(403).json({ message: 'Vous avez une séance en cours' });
        }

        next();
    });
};

module.exports = checkStatus;
