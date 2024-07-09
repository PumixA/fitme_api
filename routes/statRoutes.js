const express = require('express');
const router = express.Router();
const statController = require('../controllers/statController');
const authenticateJWT = require('../middlewares/jwt');
const {checkRoleUser, checkRoleBanni} = require("../middlewares/checkRole");
const checkStatusSeance = require("../middlewares/checkStatusSeance");

router.get('/get', authenticateJWT, checkRoleUser, checkRoleBanni, statController.getSeanceStats);

module.exports = router;
