const express = require('express');
const router = express.Router();
const comboController = require('../controllers/comboController');

router.get('/', comboController.getCombos);
router.post('/search', comboController.searchByIngredients);

module.exports = router;
