const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sqlConnection } = require('../config/db');
const {
    validateLength,
    validateContainsLetter,
    validatePassword,
    checkEmailExists,
    checkPseudoExists
} = require('../utils/validation');

exports.userRegister = async (userData) => {
    const { pseudo, email, password } = userData;

    validateLength(pseudo, 3, 25, 'pseudo');
    validateContainsLetter(pseudo, 'pseudo');

    validatePassword(password);

    const hashedPassword = await bcrypt.hash(password, 10);

    await checkEmailExists(email);
    await checkPseudoExists(pseudo);

    return new Promise((resolve, reject) => {
        const insertUserQuery = `INSERT INTO utilisateur (pseudo, email, password, role, date_inscription) VALUES (?, ?, ?, 'utilisateur', NOW())`;
        sqlConnection.query(insertUserQuery, [pseudo, email, hashedPassword], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, pseudo, email });
        });
    });
};

exports.userLogin = async ({ emailOrPseudo, password }) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPseudo);

    const query = isEmail ? 'SELECT * FROM utilisateur WHERE email = ?' : 'SELECT * FROM utilisateur WHERE pseudo = ?';

    return new Promise((resolve, reject) => {
        sqlConnection.query(query, [emailOrPseudo], async (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject(new Error(`Invalid credentials`));

            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return reject(new Error(`Invalid credentials`));

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            resolve({ token });
        });
    });
};

exports.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, email, role, date_modification FROM utilisateur';
        sqlConnection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};
