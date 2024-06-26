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
