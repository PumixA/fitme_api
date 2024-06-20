const { sqlConnection } = require('../config/db');

const validateLength = (value, minLength, maxLength, fieldName) => {
    if (value.length < minLength || value.length > maxLength) {
        throw new Error(`${fieldName} doit etre entre ${minLength} et ${maxLength} caractères`);
    }
};

const validateContainsLetter = (value, fieldName) => {
    if (!/[a-zA-Z]/.test(value)) {
        throw new Error(`${fieldName} doit contenir au moins 1 lettre`);
    }
};

const validatePassword = (password, options = {}) => {
    const { minLength = 8, maxLength = 128, specialChars = /[!@#$%^&*(),.?":{}|<>_\-]/ } = options;

    if (password.length < minLength) {
        throw new Error(`Le mot de passe doit contenir au minimum ${minLength} caractères`);
    }

    if (password.length > maxLength) {
        throw new Error(`Le mot de passe doit contenir au maximum ${maxLength} caractères`);
    }

    if (!specialChars.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins 1 caractère spécial');
    }

    if (!/[0-9]/.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins 1 chiffre');
    }

    if (!/[A-Z]/.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins 1 lettre majuscule');
    }

    if (!/[a-z]/.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins 1 lettre minuscule');
    }
};

const checkEmailExists = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM utilisateur WHERE email = ?';
        sqlConnection.query(query, [email], (err, result) => {
            if (err) return reject(err);

            if (result.length > 0) {
                return reject(new Error(`Invalid credentials`));
            }

            resolve();
        });
    });
};

const checkPseudoExists = (pseudo) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM utilisateur WHERE pseudo = ?';
        sqlConnection.query(query, [pseudo], (err, result) => {
            if (err) return reject(err);

            if (result.length > 0) {
                return reject(new Error('Invalid credentials'));
            }

            resolve();
        });
    });
};

module.exports = {
    validateLength,
    validateContainsLetter,
    validatePassword,
    checkEmailExists,
    checkPseudoExists
};
