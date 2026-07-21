const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all combos (with optional nearby budget search)
exports.getCombos = async (req, res) => {
  try {
    const { maxBudget } = req.query;

    const combos = await prisma.comboRecipe.findMany({
      include: {
        ingredients: { include: { product: true } }
      }
    });

    if (maxBudget) {
      const target = parseFloat(maxBudget);
      // Show combos within a range: target -30% to target +50%
      const lowerBound = target * 0.7;
      const upperBound = target * 1.5;

      const filtered = combos
        .filter(c => c.totalPrice >= lowerBound && c.totalPrice <= upperBound)
        .map(c => ({
          ...c,
          diff: Math.abs(c.totalPrice - target),
          isOver: c.totalPrice > target
        }))
        .sort((a, b) => a.diff - b.diff); // closest to target first

      return res.json(filtered);
    }

    // No budget filter: return all sorted by price asc
    combos.sort((a, b) => a.totalPrice - b.totalPrice);
    res.json(combos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search combos by ingredients
exports.searchByIngredients = async (req, res) => {
  try {
    const { userIngredients } = req.body; // array of product IDs user has
    if (!userIngredients || !Array.isArray(userIngredients)) {
      return res.status(400).json({ message: 'userIngredients array is required' });
    }

    const combos = await prisma.comboRecipe.findMany({
      include: {
        ingredients: {
          include: {
            product: true
          }
        }
      }
    });

    const results = combos.map(combo => {
      let missingProducts = [];
      let ownedProducts = [];

      combo.ingredients.forEach(ing => {
        if (userIngredients.includes(ing.productId)) {
          ownedProducts.push(ing.product);
        } else {
          missingProducts.push(ing.product);
        }
      });

      return {
        ...combo,
        missingCount: missingProducts.length,
        ownedCount: ownedProducts.length,
        missingProducts,
        ownedProducts
      };
    }).filter(combo => combo.ownedCount > 0);

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
