const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const authenticateJWT = require('../../middlewares/jwt');
const {checkRoleAdmin} = require("../../middlewares/checkRole");

// GET ALL
router.get('/actif', authenticateJWT, checkRoleAdmin, userController.getAllUtilisateursProfile);
router.get('/banni', authenticateJWT, checkRoleAdmin, userController.getAllBanniProfile);

// GET ONE BY ID
router.get('/:id', authenticateJWT, checkRoleAdmin, userController.getOneById);

// BANISSEMENT - DEBANISSEMENT
router.put('/ban/:id', authenticateJWT, checkRoleAdmin, userController.banOneById);
router.put('/unban/:id', authenticateJWT, checkRoleAdmin, userController.unbanOneById);


module.exports = router;
