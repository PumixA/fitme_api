const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middlewares/jwt');
const checkStatus = require('../middlewares/checkStatus');

router.post('/register', userController.userRegister);
router.post('/login', userController.userLogin);


router.get('/profile', authenticateJWT, checkStatus, userController.getUserProfile);
router.get('/adminProfile', authenticateJWT, userController.getAdminProfile);

module.exports = router;
