const express = require('express');
const router = express.Router();
const demandesInvitationController = require('../controllers/demandesInvitationController');
const authenticateJWT = require("../middlewares/jwt");

router.post('/send-invitation', authenticateJWT, demandesInvitationController.sendInvitation);

module.exports = router;
