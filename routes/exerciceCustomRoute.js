const express = require('express');
const router = express.Router();
const exerciceCustomController = require('../controllers/exerciceCustomController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser } = require("../middlewares/checkRole");
const multer = require('multer');

const upload = multer({ dest: 'uploads/exercice_custom/' });

router.post('/add', authenticateJWT, checkRoleUser, upload.single('photo'), exerciceCustomController.addCustomExercise);
router.post('/addfromexercice/:id', authenticateJWT, checkRoleUser, exerciceCustomController.addCustomExerciseFromExercice);
router.put('/edit/:id', authenticateJWT, checkRoleUser, upload.single('photo'), exerciceCustomController.editCustomExercise);
router.get('/getall', authenticateJWT, checkRoleUser, exerciceCustomController.getAllCustomExercises);
router.get('/getone/:id', authenticateJWT, checkRoleUser, exerciceCustomController.getOneCustomExercise);
router.put('/delete/:id', authenticateJWT, checkRoleUser, exerciceCustomController.deleteCustomExercise);

module.exports = router;
