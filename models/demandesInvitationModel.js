const { sqlConnection } = require('../config/db');

exports.checkInvitationEmailExists = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM demandes_invitation WHERE email = ?';
        sqlConnection.query(query, [email], (err, result) => {
            if (err) return reject(err);
            resolve(result.length > 0);
        });
    });
};

exports.checkUserEmailExists = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM utilisateur WHERE email = ?';
        sqlConnection.query(query, [email], (err, result) => {
            if (err) return reject(err);
            resolve(result.length > 0);
        });
    });
};

exports.addInvitation = (email, dateInvitation) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO demandes_invitation (email, date_invitation) VALUES (?, ?)';
        sqlConnection.query(query, [email, dateInvitation], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, email, dateInvitation });
        });
    });
};
