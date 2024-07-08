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
        await InvitationsModel.updateDateUtilisation(req.params.token);

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
        const user = await UserModel.getUserById(req.user.id); // Fetching user details
        if (!user) {
            if (file) {
                await fs.unlink(file.path).catch(console.error);
            }
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        let photoFile = user.photo_profil; // Default to existing photo file if no new file is uploaded

        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);
                return res.status(400).json({ message: 'JPG ou PNG uniquement.' });
            }

            // Define the paths
            photoFile = `${req.user.id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'users', photoFile);
            const tempCropPath = path.join(__dirname, '..', 'uploads', 'users', `temp_${photoFile}`);

            // Save the new image over the previous one
            await fs.rename(file.path, uploadPath);

            // Crop and resize the image
            await sharp(uploadPath)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(tempCropPath);

            // Overwrite the original file with the cropped image
            await fs.rename(tempCropPath, uploadPath);

            user.photo_profil = photoFile;
            user.photo_original_name = file.originalname;
            user.photo_extension = fileExtension;
        }

        let imc = null;
        if (taille && poids) {
            imc = (poids / ((taille / 100) ** 2)).toFixed(2);
        }

        const updatedProfileData = { nom, prenom, age, genre, photo_profil: photoFile, date_modification: new Date() };
        const result = await UserModel.updateUserProfile(req.user.id, updatedProfileData);

        res.status(200).json({ message: 'Profil utilisateur mis à jour avec succès', user: updatedProfileData, imc });
    } catch (err) {
        console.error('Error:', err.message);
        if (file) {
            await fs.unlink(file.path).catch(console.error);
        }
        res.status(500).json({ message: err.message });
    }
};

