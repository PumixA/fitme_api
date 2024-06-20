const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middlewares/jwt');
const checkStatus = require('../middlewares/checkStatus');

// Inscription - Connection
router.post('/register', userController.userRegister);
router.post('/login', userController.userLogin);

// Utilisateur
router.get('/profile', authenticateJWT, checkStatus, userController.getUserProfile);

// Administrateur
router.get('/adminProfile', authenticateJWT, userController.getAdminProfile);

module.exports = router;
