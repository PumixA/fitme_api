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

exports.getAdminProfile = async (req, res) => {
    try {
        const users = await UserModel.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
