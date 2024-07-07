const express = require('express');
const router = express.Router();
const exerciceController = require('../../controllers/exerciceController');
const authenticateJWT = require('../../middlewares/jwt');
const { checkRoleAdmin } = require("../../middlewares/checkRole");
const multer = require('multer');

const upload = multer({ dest: 'uploads/exercices/' });


router.get('/', authenticateJWT, checkRoleAdmin, exerciceController.getAllExercises);
router.get('/getone/:id', authenticateJWT, checkRoleAdmin, exerciceController.getOneExercise);
router.post('/add', authenticateJWT, checkRoleAdmin, upload.single('photo'), exerciceController.addExercise);
router.put('/edit/:id', authenticateJWT, checkRoleAdmin, upload.single('photo'), exerciceController.editExercise);

module.exports = router;
