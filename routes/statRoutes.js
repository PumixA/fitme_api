const express = require('express');
const router = express.Router();
const statController = require('../controllers/statController');
const authenticateJWT = require('../middlewares/jwt');

router.get('/get', authenticateJWT, statController.getSeanceStats);

module.exports = router;
