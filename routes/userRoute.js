const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middlewares/jwt');
const checkStatusSeance = require('../middlewares/checkStatusSeance');
const {checkRoleAdmin} = require("../middlewares/checkRole");

// Inscription - Connection
router.post('/register', userController.userRegister);
router.post('/login', userController.userLogin);





module.exports = router;
