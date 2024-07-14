const express = require('express');
const router = express.Router();
const seanceController = require('../controllers/seanceController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser, checkRoleBanni} = require("../middlewares/checkRole");
const checkStatusSeance = require("../middlewares/checkStatusSeance");


router.post('/add', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.addSeance);
router.get('/getall', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.getAllSeances);
router.put('/edit/:id', authenticateJWT, checkRoleUser, checkRoleBanni, checkStatusSeance, seanceController.editSeance);
router.get('/getone/:id', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.getOneSeance);
router.put('/delete/:id', authenticateJWT, checkRoleUser, checkRoleBanni, checkStatusSeance, seanceController.deleteSeance);
router.put('/deleteExercice/:id_seance/:id_exercice_custom', authenticateJWT, checkRoleUser, checkRoleBanni, checkStatusSeance, seanceController.deleteExerciceFromSeance);

router.post('/start/:id', authenticateJWT, checkRoleUser, checkRoleBanni, checkStatusSeance, seanceController.startSeance);
router.get('/getchrono/:id', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.getChrono);
router.get('/start/get_exercices/:id', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.getSeanceExercices);
router.get('/start/getone_exercice/:seanceId/:exerciceId', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.getOneExercice);
router.put('/start/do_exercise/edit/:id', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.editExercice);
router.put('/end/:id', authenticateJWT, checkRoleUser, checkRoleBanni, seanceController.endSeance);

module.exports = router;
