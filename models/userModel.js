const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sqlConnection } = require('../config/db');

exports.userRegister = async (userData) => {
    const { pseudo, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
        const checkEmailQuery = 'SELECT * FROM utilisateur WHERE email = ?';
        sqlConnection.query(checkEmailQuery, [email], (err, result) => {
            if (err) return reject(err);

            if (result.length > 0) {
                return reject(new Error('Email already exists'));
            }

            const insertUserQuery = `INSERT INTO utilisateur (pseudo, email, password, role, date_inscription) VALUES (?, ?, ?, 'utilisateur', NOW())`;
            sqlConnection.query(insertUserQuery, [pseudo, email, hashedPassword], (err, result) => {
                if (err) return reject(err);
                resolve({ id: result.insertId, pseudo, email });
            });
        });
    });
};

exports.userLogin = async ({ email, password }) => {
    const query = 'SELECT * FROM utilisateur WHERE email = ?';
    return new Promise((resolve, reject) => {
        sqlConnection.query(query, [email], async (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject(new Error(`L'utilisateur n'existe pas`));

            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return reject(new Error(`Invalid credentials`));

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            resolve({ token });
        });
    });
};

exports.getUserById = (id) => {
    const query = 'SELECT id, pseudo, email, role FROM utilisateur WHERE id = ?';
    return new Promise((resolve, reject) => {
        sqlConnection.query(query, [id], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return resolve(null);
            resolve(result[0]);
        });
    });
};
