const express = require('express');
const router = express.Router();
const exerciceCustomController = require('../controllers/exerciceCustomController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser, checkRoleBanni} = require("../middlewares/checkRole");
const multer = require('multer');
const checkStatusSeance = require("../middlewares/checkStatusSeance");

const upload = multer({ dest: 'uploads/exercice_custom/' });


router.post('/add', authenticateJWT, checkRoleUser, checkRoleBanni, checkStatusSeance, upload.single('photo'), exerciceCustomController.addCustomExercise);
router.post('/addfromexercice/:id', authenticateJWT, checkRoleUser, checkRoleBanni, checkStatusSeance, exerciceCustomController.addCustomExerciseFromExercice);
router.put('/edit/:id', authenticateJWT, checkRoleUser, checkRoleBanni, checkStatusSeance, upload.single('photo'), exerciceCustomController.editCustomExercise);
router.get('/getall', authenticateJWT, checkRoleUser, checkRoleBanni, exerciceCustomController.getAllCustomExercises);
router.get('/getone/:id', authenticateJWT, checkRoleUser, checkRoleBanni, exerciceCustomController.getOneCustomExercise);
router.put('/delete/:id', authenticateJWT, checkRoleUser, checkRoleBanni, checkStatusSeance, exerciceCustomController.deleteCustomExercise);

module.exports = router;
