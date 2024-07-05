const express = require('express');
const router = express.Router();
const exerciceCustomController = require('../controllers/exerciceCustomController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser } = require("../middlewares/checkRole");
const multer = require('multer');

const upload = multer({ dest: 'uploads/exercice_custom/' });

router.post('/add', authenticateJWT, checkRoleUser, upload.single('photo'), exerciceCustomController.addCustomExercise);

module.exports = router;
