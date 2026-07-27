const express = require('express');
const router = express.Router();
const fridgeController = require('../controllers/fridgeController');

// GET /api/fridge/ingredients - Get all fridge ingredients
router.get('/ingredients', fridgeController.getFridgeIngredients);

// POST /api/fridge/search - Search fridge menus by ingredients
router.post('/search', fridgeController.searchByFridgeIngredients);

// GET /api/fridge/menus - Get all fridge menus (no budget limit for now)
router.get('/menus', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const menus = await prisma.fridgeMenu.findMany({
      include: {
        ingredients: { include: { ingredient: true } }
      }
    });
    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
