const express = require('express');
const router = express.Router();
const groupeMusculaireController = require('../../controllers/groupeMusculaireController');
const authenticateJWT = require('../../middlewares/jwt');
const { checkRoleAdmin } = require("../../middlewares/checkRole");

// Add the new route for getting all muscle groups
router.get('/', authenticateJWT, checkRoleAdmin, groupeMusculaireController.getAllGroupeMusculaire);

// Get one muscle group by ID
router.get('/getone/:id', authenticateJWT, checkRoleAdmin, groupeMusculaireController.getOneGroupeMusculaire);

// Edit a muscle group by ID
router.put('/edit/:id', authenticateJWT, checkRoleAdmin, groupeMusculaireController.editGroupeMusculaire);

// Add a new muscle group
router.post('/add', authenticateJWT, checkRoleAdmin, groupeMusculaireController.addGroupeMusculaire);


module.exports = router;
