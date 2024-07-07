const express = require('express');
const router = express.Router();
const demandesInvitationController = require('../controllers/demandesInvitationController');

router.post('/demandes_invitation', demandesInvitationController.sendInvitation);

module.exports = router;
