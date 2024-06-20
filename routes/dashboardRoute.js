const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateJWT = require('../middlewares/jwt');
const {checkRoleUser} = require("../middlewares/checkRole");

router.get('/', authenticateJWT, checkRoleUser, dashboardController.getFilteredSeance);

module.exports = router;
