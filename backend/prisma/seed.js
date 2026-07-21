const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Create Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('Admin user created:', admin.username);

  // 2. Create sample products
  const product1 = await prisma.product.create({
    data: { name: 'ข้าวสวย (Steamed Rice)', price: 15, category: 'Rice', imageUrl: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400' }
  });
  const product2 = await prisma.product.create({
    data: { name: 'ไข่ตุ๋น (Steamed Egg)', price: 20, category: 'Egg', imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=400' }
  });
  const product3 = await prisma.product.create({
    data: { name: 'ไส้กรอกชีส (Cheese Sausage)', price: 42, category: 'Meat', imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400' }
  });

  // 3. Create Sample Combo Recipe
  const combo = await prisma.comboRecipe.create({
    data: {
      name: 'ข้าวไข่ตุ๋นไส้กรอกชีสลาวา',
      description: 'เมนูยอดฮิตช่วงปลายเดือน อิ่มอร่อยได้คุณค่า',
      totalPrice: product1.price + product2.price + product3.price,
      imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830f5c90683?w=800',
      isOfficial: true,
      ingredients: {
        create: [
          { productId: product1.id },
          { productId: product2.id },
          { productId: product3.id }
        ]
      }
    }
  });

  console.log('Sample Combo Created:', combo.name);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
