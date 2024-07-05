const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middlewares/jwt');
const checkStatusSeance = require('../middlewares/checkStatusSeance');
const {checkRoleAdmin, checkRoleUser} = require("../middlewares/checkRole");
const checkInvitationToken = require("../middlewares/checkInvitationToken");
const multer = require('multer');

const upload = multer({ dest: 'uploads/users/' });

// Inscription - Connection
router.post('/register/:token', checkInvitationToken, userController.userRegister);
router.post('/login', userController.userLogin);


router.get('/get', authenticateJWT, checkRoleUser, userController.getUserProfile);
router.put('/edit', authenticateJWT, checkRoleUser, upload.single('photo_profil'), userController.updateUserProfile);

module.exports = router;
