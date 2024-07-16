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

            const updateQuery = 'UPDATE utilisateur SET date_modification = NOW() WHERE id = ?';
            sqlConnection.query(updateQuery, [user.id], (err) => {
                if (err) return reject(err);

                const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
                resolve({ token });
            });
        });
    });
};

exports.getOneById = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT id, email, pseudo, nom, prenom, age, genre, photo_profil, date_inscription, date_modification
            FROM utilisateur
            WHERE id = ?`;
        sqlConnection.query(query, [id], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject(new Error('Utilisateur non trouvé'));
            resolve(result[0]);
        });
    });
};

exports.getAllUsersByRole = (role) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, email, role, date_modification FROM utilisateur WHERE role = ?';
        sqlConnection.query(query, [role], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.updateUserRole = (id, role) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE utilisateur SET role = ? WHERE id = ?';
        sqlConnection.query(query, [role, id], (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) return reject(new Error('Utilisateur non trouvé'));
            resolve({ message: `Le rôle de l'utilisateur a été mis a jour a : ${role}` });
        });
    });
};

exports.countUsers = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM utilisateur WHERE role = "utilisateur"';
        sqlConnection.query(query, (err, result) => {
            if (err) return reject(err);
            resolve(result[0].count);
        });
    });
};

exports.getUserProfile = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT id, email, pseudo, nom, prenom, age, genre, photo_profil, date_inscription
            FROM utilisateur
            WHERE id = ?`;
        sqlConnection.query(query, [id], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject(new Error('Utilisateur non trouvé'));
            resolve(result[0]);
        });
    });
};

exports.updateUserProfile = (userId, profileData) => {
    return new Promise((resolve, reject) => {
        const { nom, prenom, age, genre, photo_profil, date_modification } = profileData;

        const query = `
            UPDATE utilisateur 
            SET nom = ?, prenom = ?, age = ?, genre = ?, photo_profil = ?, date_modification = ?
            WHERE id = ?
        `;
        const values = [nom, prenom, age, genre, photo_profil, date_modification, userId];

        sqlConnection.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve({ message: 'Profil utilisateur mis à jour avec succès' });
        });
    });
};

exports.getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM utilisateur WHERE id = ?`;
        sqlConnection.query(query, [userId], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
}

exports.updateUserSeance = (userId, statusSeanceId) => {
    return new Promise((resolve, reject) => {
        const updateUserSeanceQuery = 'UPDATE utilisateur SET id_status_seance = ? WHERE id = ?';
        sqlConnection.query(updateUserSeanceQuery, [statusSeanceId, userId], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

exports.getStatusSeance = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id_status_seance FROM utilisateur WHERE id = ?';
        sqlConnection.query(query, [userId], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error('Utilisateur non trouvé'));
            resolve(results[0].id_status_seance);
        });
    });
};
