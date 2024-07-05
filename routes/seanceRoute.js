const express = require('express');
const router = express.Router();
const seanceController = require('../controllers/seanceController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser } = require("../middlewares/checkRole");

router.post('/add', authenticateJWT, checkRoleUser, seanceController.addSeance);
router.get('/getall', authenticateJWT, checkRoleUser, seanceController.getAllSeances);

module.exports = router;
