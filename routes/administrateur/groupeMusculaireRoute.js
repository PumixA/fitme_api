const express = require('express');
const router = express.Router();
const groupeMusculaireController = require('../../controllers/groupeMusculaireController');
const authenticateJWT = require('../../middlewares/jwt');
const { checkRoleAdmin } = require("../../middlewares/checkRole");

// Add the new route for getting all muscle groups
router.get('/', authenticateJWT, checkRoleAdmin, groupeMusculaireController.getAllGroupeMusculaire);

module.exports = router;
