const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middlewares/jwt');

router.post('/register', userController.userRegister);
router.post('/login', userController.userlogin);

// Exemple de route protegée
router.get('/profile', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

module.exports = router;
