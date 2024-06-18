const UserModel = require('../models/userModel');
const { sqlConnection} = require('../config/db');

exports.userRegister = async (req, res) => {
    try {
        const user = await UserModel.userRegister(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
}

exports.userlogin = async (req, res) => {
    try {
        const token = await UserModel.userLogin(req.body);
        res.status(201).json({ message: 'Connection réussie', token });
    } catch (err) {
        res.status(400).json({message: err.message});
    }
}