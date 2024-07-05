const UserModel = require('../models/userModel');
const InvitationsModel = require('../models/invitationsModel');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

exports.userRegister = async (req, res) => {
    try {
        const user = await UserModel.userRegister(req.body);

        await InvitationsModel.incrementTokenUsage(req.params.token);
        await InvitationsModel.updateDateUtilisation(req.params.token);  // New line to update date_utilisation

        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.userLogin = async (req, res) => {
    try {
        const { token } = await UserModel.userLogin(req.body);
        res.status(201).json({ message: 'Connection réussie', token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllUtilisateursProfile = async (req, res) => {
    try {
        const users = await UserModel.getAllUsersByRole('utilisateur');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllBanniProfile = async (req, res) => {
    try {
        const users = await UserModel.getAllUsersByRole('banni');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneById = async (req, res) => {
    try {
        const user = await UserModel.getOneById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.banOneById = async (req, res) => {
    try {
        const result = await UserModel.updateUserRole(req.params.id, 'banni');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.unbanOneById = async (req, res) => {
    try {
        const result = await UserModel.updateUserRole(req.params.id, 'utilisateur');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.countUsers = async (req, res) => {
    try {
        const userCount = await UserModel.countUsers();
        res.status(200).json({ count: userCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await UserModel.getUserProfile(req.user.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    const { nom, prenom, age, genre, taille, poids } = req.body;
    const file = req.file;

    try {
        let photoFile = null;

        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);  // Delete the invalid file
                return res.status(400).json({ message: 'Invalid file extension. Only .jpg and .png are allowed.' });
            }

            photoFile = `${req.user.id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'users', photoFile);

            // Resize and crop the image to 500x500 pixels
            await sharp(file.path)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(uploadPath);

            // Delete the temporary file
            await fs.unlink(file.path);
        }

        const result = await UserModel.updateUserProfile(req.user.id, req.body, photoFile);
        res.status(200).json(result);
    } catch (err) {
        if (file) {
            await fs.open(file.path, 'r').then(fd => fd.close()).catch(console.error);
            await fs.unlink(file.path).catch(console.error);  // Ensure the temporary file is deleted in case of an error
        }
        res.status(500).json({ message: err.message });
    }
};

