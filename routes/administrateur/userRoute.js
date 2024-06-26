const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const invitationsController = require('../../controllers/invitationsController');
const authenticateJWT = require('../../middlewares/jwt');
const { checkRoleAdmin } = require("../../middlewares/checkRole");

// GET ALL
router.get('/actif', authenticateJWT, checkRoleAdmin, userController.getAllUtilisateursProfile);
router.get('/banni', authenticateJWT, checkRoleAdmin, userController.getAllBanniProfile);

// GET ONE BY ID
router.get('/getone/:id', authenticateJWT, checkRoleAdmin, userController.getOneById);

// BANISSEMENT - DEBANISSEMENT
router.put('/ban/:id', authenticateJWT, checkRoleAdmin, userController.banOneById);
router.put('/unban/:id', authenticateJWT, checkRoleAdmin, userController.unbanOneById);

// INVITER
router.post('/inviter', authenticateJWT, checkRoleAdmin, invitationsController.inviter);
router.get('/inviter/getall', authenticateJWT, checkRoleAdmin, invitationsController.getAllInvitations);
router.get('/count', userController.countUsers);

module.exports = router;
