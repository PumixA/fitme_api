const UserModel = require('../models/userModel');

exports.userRegister = async (req, res) => {
    try {
        const user = await UserModel.userRegister(req.body);
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
