const express = require('express');
const router = express.Router();
const demandesInvitationController = require('../../controllers/demandesInvitationController');
const authenticateJWT = require('../../middlewares/jwt');
const {checkRoleAdmin} = require("../../middlewares/checkRole");


router.get('/', authenticateJWT, checkRoleAdmin, demandesInvitationController.getAllDemandes);
router.delete('/:id', authenticateJWT, checkRoleAdmin, demandesInvitationController.deleteDemande);

module.exports = router;
