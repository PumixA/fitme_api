const express = require('express');
const router = express.Router();
const seanceController = require('../controllers/seanceController');
const authenticateJWT = require('../middlewares/jwt');
const { checkRoleUser } = require("../middlewares/checkRole");

router.post('/add', authenticateJWT, checkRoleUser, seanceController.addSeance);
router.get('/getall', authenticateJWT, checkRoleUser, seanceController.getAllSeances);
router.put('/edit/:id', authenticateJWT, checkRoleUser, seanceController.editSeance);
router.get('/getone/:id', authenticateJWT, checkRoleUser, seanceController.getOneSeance);
router.put('/delete/:id', authenticateJWT, checkRoleUser, seanceController.deleteSeance);

module.exports = router;
