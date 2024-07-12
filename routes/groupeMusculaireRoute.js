const express = require('express');
const router = express.Router();
const groupeMusculaireController = require('../controllers/groupeMusculaireController');
const authenticateJWT = require('../middlewares/jwt');
const {checkRoleUser} = require("../middlewares/checkRole");


router.get('/', authenticateJWT, checkRoleUser, groupeMusculaireController.getAllGroupeMusculaire);


module.exports = router;
