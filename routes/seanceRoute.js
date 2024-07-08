const express = require('express');
const router = express.Router();
const seanceController = require('../controllers/seanceController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser, checkRoleBanni} = require("../middlewares/checkRole");


router.post('/add', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.addSeance);
router.get('/getall', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.getAllSeances);
router.put('/edit/:id', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.editSeance);
router.get('/getone/:id', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.getOneSeance);
router.put('/delete/:id', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.deleteSeance);
router.put('/deleteExercice/:id_seance/:id_exercice_custom', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.deleteExerciceFromSeance);

module.exports = router;
