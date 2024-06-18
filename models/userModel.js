const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sqlConnection } = require('../config/db');

exports.userRegister = async (userData) => {
    const { pseudo, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO utilisateur (pseudo, email, password, role, date_inscription) VALUES (?, ?, ?, 'utilisateur', NOW())`;
    return new Promise((resolve, reject) => {
        sqlConnection.query(query, [pseudo, email, hashedPassword], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, pseudo, email });
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

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            resolve(token);
        });
    });
};
