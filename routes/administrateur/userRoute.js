const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const authenticateJWT = require('../../middlewares/jwt');
const checkStatusSeance = require('../../middlewares/checkStatusSeance');
const {checkRoleAdmin} = require("../../middlewares/checkRole");

router.get('/actif', authenticateJWT, checkRoleAdmin, userController.getAllUtilisateursProfile);
router.get('/banni', authenticateJWT, checkRoleAdmin, userController.getAllBanniProfile);

module.exports = router;
