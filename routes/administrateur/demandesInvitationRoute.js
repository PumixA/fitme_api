const express = require('express');
const router = express.Router();
const demandesInvitationController = require('../../controllers/demandesInvitationController');
const authenticateJWT = require('../../middlewares/jwt');
const checkStatusSeance = require('../../middlewares/checkStatusSeance');
const {checkRoleAdmin} = require("../../middlewares/checkRole");

// GET ALL
router.get('/', authenticateJWT, checkRoleAdmin, demandesInvitationController.getAllDemandes);

// DELETE
router.delete('/:id', authenticateJWT, checkRoleAdmin, demandesInvitationController.deleteDemande);

module.exports = router;
