const express = require('express');
const router = express.Router();
const exerciceController = require('../../controllers/exerciceController');
const authenticateJWT = require('../../middlewares/jwt');
const { checkRoleAdmin } = require("../../middlewares/checkRole");

// Get all exercises, with optional filtering by muscle group
router.get('/', authenticateJWT, checkRoleAdmin, exerciceController.getAllExercises);

// Get one exercise by ID
router.get('/getone/:id', authenticateJWT, checkRoleAdmin, exerciceController.getOneExercise);

module.exports = router;
