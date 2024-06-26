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
        const query = 'INSERT INTO invitations (email, token, nombre_utilisation, limite_utilisation, date_creation) VALUES (?, ?, 0, ?, ?)';
        sqlConnection.query(query, [email, token, limite_utilisation, date_creation], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, email, token, limite_utilisation, date_creation });
        });
    });
};

exports.checkTokenValid = (token) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM invitations WHERE token = ?';
        sqlConnection.query(query, [token], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject(new Error('Invalid token'));
            resolve(result[0]);
        });
    });
};

exports.incrementTokenUsage = (token) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE invitations SET nombre_utilisation = nombre_utilisation + 1 WHERE token = ?';
        sqlConnection.query(query, [token], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

exports.getAllInvitations = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, email, nombre_utilisation, limite_utilisation, date_utilisation FROM invitations';
        sqlConnection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.getOneInvitation = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, email, nombre_utilisation, limite_utilisation, date_utilisation, token FROM invitations WHERE id = ?';
        sqlConnection.query(query, [id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
};

exports.editInvitation = (id, limite_utilisation) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE invitations SET limite_utilisation = ? WHERE id = ?';
        sqlConnection.query(query, [limite_utilisation, id], (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) return resolve(null);
            resolve(result);
        });
    });
};

exports.updateDateUtilisation = (token) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE invitations SET date_utilisation = NOW() WHERE token = ?';
        sqlConnection.query(query, [token], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};
