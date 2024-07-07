const express = require('express');
const router = express.Router();
const exerciceController = require('../controllers/exerciceController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser, checkRoleBanni} = require("../middlewares/checkRole");


router.get('/getall', authenticateJWT, checkRoleUser, checkRoleBanni, exerciceController.getAllExercises);
router.get('/getone/:id', authenticateJWT, checkRoleUser, checkRoleBanni, exerciceController.getOneExercise);

module.exports = router;
