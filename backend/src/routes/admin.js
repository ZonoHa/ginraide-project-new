const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Stats
router.get('/stats', adminController.getStats);

// Combos
router.get('/combos', (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.comboRecipe.findMany({ include: { ingredients: { include: { product: true } } }, orderBy: { id: 'asc' } })
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err.message }));
});
router.post('/combos', adminController.createCombo);
router.put('/combos/:id', adminController.updateCombo);
router.delete('/combos/:id', adminController.deleteCombo);

// Products
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Posts Moderation
router.get('/posts', adminController.getAllPosts);
router.delete('/posts/:id', adminController.deletePost);

// Users
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);

module.exports = router;
