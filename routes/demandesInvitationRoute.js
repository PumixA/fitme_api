const express = require('express');
const router = express.Router();
const demandesInvitationController = require('../controllers/demandesInvitationController');
const authenticateJWT = require("../middlewares/jwt");

router.post('/demandes_invitation', authenticateJWT, demandesInvitationController.sendInvitation);

module.exports = router;
