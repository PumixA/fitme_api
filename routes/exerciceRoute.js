const express = require('express');
const router = express.Router();
const exerciceController = require('../controllers/exerciceController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser } = require("../middlewares/checkRole");

router.get('/getall', authenticateJWT, checkRoleUser, exerciceController.getAllExercises);

module.exports = router;