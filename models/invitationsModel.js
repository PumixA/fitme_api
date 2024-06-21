const { sqlConnection } = require('../config/db');
const crypto = require('crypto');

exports.checkUserEmailExists = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM utilisateur WHERE email = ?';
        sqlConnection.query(query, [email], (err, result) => {
            if (err) return reject(err);
            resolve(result.length > 0);
        });
    });
};

exports.checkInvitationEmailExists = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM invitations WHERE email = ?';
        sqlConnection.query(query, [email], (err, result) => {
            if (err) return reject(err);
            resolve(result.length > 0);
        });
    });
};

exports.createInvitation = (email, limite_utilisation) => {
    const token = crypto.randomBytes(20).toString('hex');
    const date_creation = new Date();

    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO invitations (email, token, limite_utilisation, date_creation) VALUES (?, ?, ?, ?)';
        sqlConnection.query(query, [email, token, limite_utilisation, date_creation], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, email, token, limite_utilisation, date_creation });
        });
    });
};
