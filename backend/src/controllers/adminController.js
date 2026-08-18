const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== STATS ====================
exports.getStats = async (req, res) => {
  try {
    const [userCount, postCount, comboCount, productCount, fridgeMenuCount, fridgeIngredientCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comboRecipe.count(),
      prisma.product.count(),
      prisma.fridgeMenu.count(),
      prisma.fridgeIngredient.count()
    ]);
    res.json({ userCount, postCount, comboCount, productCount, fridgeMenuCount, fridgeIngredientCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== COMBOS ====================
exports.deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comboRecipe.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Combo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, totalPrice, imageUrl, productIds } = req.body;

    // Delete existing ingredients then re-create
    await prisma.recipeIngredient.deleteMany({ where: { comboId: parseInt(id) } });

    const combo = await prisma.comboRecipe.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        totalPrice: parseFloat(totalPrice),
        imageUrl,
        ingredients: {
          create: (productIds || []).map(pid => ({ productId: parseInt(pid) }))
        }
      },
      include: { ingredients: { include: { product: true } } }
    });

    res.json(combo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCombo = async (req, res) => {
  try {
    const { name, description, totalPrice, imageUrl, productIds } = req.body;
    const combo = await prisma.comboRecipe.create({
      data: {
        name,
        description,
        totalPrice: parseFloat(totalPrice),
        imageUrl,
        isOfficial: true,
        ingredients: {
          create: (productIds || []).map(id => ({ productId: parseInt(id) }))
        }
      },
      include: { ingredients: { include: { product: true } } }
    });
    res.status(201).json(combo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== PRODUCTS ====================
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body;
    const product = await prisma.product.create({
      data: { name, price: parseFloat(price), category, imageUrl }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, imageUrl } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { name, price: parseFloat(price), category, imageUrl }
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== POSTS MODERATION ====================
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.post.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== USERS MODERATION ====================
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, username: true, role: true, createdAt: true, commentBanUntil: true,
        _count: { select: { posts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const banUntil = new Date();
    banUntil.setDate(banUntil.getDate() + 3);
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { commentBanUntil: banUntil }
    });
    res.json({ message: 'User banned from commenting for 3 days' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { commentBanUntil: null }
    });
    res.json({ message: 'User unbanned' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== FRIDGE INGREDIENTS ====================
exports.getFridgeIngredients = async (req, res) => {
  try {
    const ingredients = await prisma.fridgeIngredient.findMany({ orderBy: { id: 'asc' } });
    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createFridgeIngredient = async (req, res) => {
  try {
    const { name, category, imageUrl } = req.body;
    const ingredient = await prisma.fridgeIngredient.create({
      data: { name, category, imageUrl }
    });
    res.status(201).json(ingredient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateFridgeIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, imageUrl } = req.body;
    const ingredient = await prisma.fridgeIngredient.update({
      where: { id: parseInt(id) },
      data: { name, category, imageUrl }
    });
    res.json(ingredient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteFridgeIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fridgeIngredient.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Fridge ingredient deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== FRIDGE MENUS ====================
exports.getFridgeMenus = async (req, res) => {
  try {
    const menus = await prisma.fridgeMenu.findMany({ include: { ingredients: { include: { ingredient: true } } }, orderBy: { id: 'asc' } });
    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteFridgeMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fridgeMenu.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Fridge menu deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateFridgeMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, ingredientIds } = req.body;

    await prisma.fridgeMenuIngredient.deleteMany({ where: { menuId: parseInt(id) } });

    const menu = await prisma.fridgeMenu.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        imageUrl,
        ingredients: {
          create: (ingredientIds || []).map(ingId => ({ ingredientId: parseInt(ingId) }))
        }
      },
      include: { ingredients: { include: { ingredient: true } } }
    });

    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createFridgeMenu = async (req, res) => {
  try {
    const { name, description, imageUrl, ingredientIds } = req.body;
    const menu = await prisma.fridgeMenu.create({
      data: {
        name,
        description,
        imageUrl,
        ingredients: {
          create: (ingredientIds || []).map(id => ({ ingredientId: parseInt(id) }))
        }
      },
      include: { ingredients: { include: { ingredient: true } } }
    });
    res.status(201).json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
