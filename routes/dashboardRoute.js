const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateJWT = require('../middlewares/jwt');
const {checkRoleUser, checkRoleBanni} = require("../middlewares/checkRole");

router.get('/', authenticateJWT, checkRoleBanni, checkRoleUser, dashboardController.getFilteredSeance);

module.exports = router;
