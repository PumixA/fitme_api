const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateJWT = require('../middlewares/jwt');

router.get('/filtered-seance', authenticateJWT, dashboardController.getFilteredSeance);

module.exports = router;
