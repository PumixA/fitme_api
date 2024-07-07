const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const invitationsController = require('../../controllers/invitationsController');
const authenticateJWT = require('../../middlewares/jwt');
const { checkRoleAdmin } = require("../../middlewares/checkRole");


router.get('/actif', authenticateJWT, checkRoleAdmin, userController.getAllUtilisateursProfile);
router.get('/banni', authenticateJWT, checkRoleAdmin, userController.getAllBanniProfile);
router.get('/getone/:id', authenticateJWT, checkRoleAdmin, userController.getOneById);
router.put('/ban/:id', authenticateJWT, checkRoleAdmin, userController.banOneById);
router.put('/unban/:id', authenticateJWT, checkRoleAdmin, userController.unbanOneById);

router.post('/inviter', authenticateJWT, checkRoleAdmin, invitationsController.inviter);
router.put('/inviter/edit/:id', authenticateJWT, checkRoleAdmin, invitationsController.editInvitation);
router.get('/inviter/getall', authenticateJWT, checkRoleAdmin, invitationsController.getAllInvitations);
router.get('/inviter/getone/:id', authenticateJWT, checkRoleAdmin, invitationsController.getOneInvitation);
router.get('/count', userController.countUsers);

module.exports = router;
