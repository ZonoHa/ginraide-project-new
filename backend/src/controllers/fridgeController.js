const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all fridge ingredients
exports.getFridgeIngredients = async (req, res) => {
  try {
    const ingredients = await prisma.fridgeIngredient.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search fridge menus by fridge ingredients
exports.searchByFridgeIngredients = async (req, res) => {
  try {
    const { userIngredients } = req.body; // array of fridgeIngredient IDs user has
    if (!userIngredients || !Array.isArray(userIngredients)) {
      return res.status(400).json({ message: 'userIngredients array is required' });
    }

    const menus = await prisma.fridgeMenu.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

    const results = menus.map(menu => {
      let missingProducts = [];
      let ownedProducts = [];

      menu.ingredients.forEach(ing => {
        if (userIngredients.includes(ing.ingredientId)) {
          ownedProducts.push(ing.ingredient);
        } else {
          missingProducts.push(ing.ingredient);
        }
      });

      return {
        ...menu,
        missingCount: missingProducts.length,
        ownedCount: ownedProducts.length,
        missingProducts,
        ownedProducts
      };
    }).filter(menu => menu.ownedCount > 0);

    // Sort by most owned ingredients first, then least missing
    results.sort((a, b) => {
      if (b.ownedCount !== a.ownedCount) {
        return b.ownedCount - a.ownedCount;
      }
      return a.missingCount - b.missingCount;
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
