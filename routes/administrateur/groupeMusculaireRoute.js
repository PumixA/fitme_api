const express = require('express');
const router = express.Router();
const groupeMusculaireController = require('../../controllers/groupeMusculaireController');
const authenticateJWT = require('../../middlewares/jwt');
const { checkRoleAdmin } = require("../../middlewares/checkRole");


router.get('/', authenticateJWT, checkRoleAdmin, groupeMusculaireController.getAllGroupeMusculaire);
router.get('/getone/:id', authenticateJWT, checkRoleAdmin, groupeMusculaireController.getOneGroupeMusculaire);
router.put('/edit/:id', authenticateJWT, checkRoleAdmin, groupeMusculaireController.editGroupeMusculaire);
router.post('/add', authenticateJWT, checkRoleAdmin, groupeMusculaireController.addGroupeMusculaire);


module.exports = router;
