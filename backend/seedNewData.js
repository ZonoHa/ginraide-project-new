const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding new dorm ingredients and combos...');

  // Create or get Products
  const productsData = [
    { name: 'มาม่า (Instant Noodles)', price: 10, category: 'อาหาร', imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800' },
    { name: 'ปลากระป๋อง (Canned Fish)', price: 20, category: 'อาหาร', imageUrl: 'https://images.unsplash.com/photo-1596796985068-0fb5f92de0ec?w=800' },
    { name: 'ขนมปังแผ่น (Sliced Bread)', price: 25, category: 'ขนม', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800' },
    { name: 'นมข้นหวาน (Condensed Milk)', price: 22, category: 'เครื่องปรุง', imageUrl: 'https://images.unsplash.com/photo-1528750717929-32abb73d3bd9?w=800' },
    { name: 'ไข่ไก่ (Raw Egg)', price: 6, category: 'วัตถุดิบดิบ', imageUrl: 'https://images.unsplash.com/photo-1498653912180-2a29486cba7b?w=800' }
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      const created = await prisma.product.create({ data: p });
      createdProducts.push(created);
      console.log(`Created product: ${p.name}`);
    } else {
      createdProducts.push(existing);
    }
  }

  // Map products for easier access
  const productMap = createdProducts.reduce((map, p) => {
    map[p.name] = p;
    return map;
  }, {});

  // Define new combos
  const combosData = [
    {
      name: 'มาม่าปลากระป๋องต้มยำ',
      description: '1. ต้มน้ำให้เดือด ใส่ผงปรุงรสมาม่า\n2. ใส่เส้นมาม่าลงไปต้มประมาณ 2 นาที\n3. เทปลากระป๋องลงไปคนให้เข้ากัน\n4. ตอกไข่ไก่ลงไป (ถ้ามี) ปิดไฟ พร้อมทาน!',
      totalPrice: 30, // 10 + 20
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a827cb0ce6e?w=800',
      isOfficial: true,
      ingredients: [productMap['มาม่า (Instant Noodles)'].id, productMap['ปลากระป๋อง (Canned Fish)'].id]
    },
    {
      name: 'ปังปิ้งนมข้นหวาน',
      description: '1. นำขนมปังแผ่นไปปิ้งบนกระทะหรือเครื่องปิ้งให้เหลืองกรอบ\n2. ราดด้วยนมข้นหวานให้ทั่วแผ่น\n3. หั่นเป็นชิ้นพอดีคำ เสิร์ฟคู่กับนมร้อนๆ',
      totalPrice: 47, // 25 + 22
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
      isOfficial: true,
      ingredients: [productMap['ขนมปังแผ่น (Sliced Bread)'].id, productMap['นมข้นหวาน (Condensed Milk)'].id]
    },
    {
      name: 'มาม่าไข่เจียว',
      description: '1. ลวกเส้นมาม่าให้นิ่มพอประมาณ แล้วตักขึ้นสะเด็ดน้ำ\n2. ตอกไข่ไก่ใส่ชาม ใส่ผงมาม่า คนให้เข้ากัน\n3. นำเส้นมาม่าลงไปคลุกกับไข่\n4. ตั้งกระทะ ทอดให้เหลืองกรอบทั้งสองด้าน',
      totalPrice: 16, // 10 + 6
      imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800',
      isOfficial: true,
      ingredients: [productMap['มาม่า (Instant Noodles)'].id, productMap['ไข่ไก่ (Raw Egg)'].id]
    }
  ];

  for (const c of combosData) {
    const existing = await prisma.comboRecipe.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.comboRecipe.create({
        data: {
          name: c.name,
          description: c.description,
          totalPrice: c.totalPrice,
          imageUrl: c.imageUrl,
          isOfficial: c.isOfficial,
          ingredients: {
            create: c.ingredients.map(id => ({ productId: id }))
          }
        }
      });
      console.log(`Created combo: ${c.name}`);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
