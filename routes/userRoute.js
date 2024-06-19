const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middlewares/jwt');

router.post('/register', userController.userRegister);
router.post('/login', userController.userLogin);

// Route pour récupérer les informations de l'utilisateur connecté, avec vérification du rôle
router.get('/profile', authenticateJWT, userController.getUserProfile);
router.get('/adminProfile', authenticateJWT, userController.getAdminProfile);

module.exports = router;
