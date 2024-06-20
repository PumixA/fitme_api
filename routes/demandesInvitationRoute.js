const express = require('express');
const router = express.Router();
const demandesInvitationController = require('../controllers/demandesInvitationController');

router.post('/send-invitation', demandesInvitationController.sendInvitation);

module.exports = router;
