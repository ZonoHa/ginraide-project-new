const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('081890', 10);
  
  // Check if pastis exists
  const existingUser = await prisma.user.findUnique({ where: { username: 'pastis' } });
  
  if (existingUser) {
    // Update role and password
    await prisma.user.update({
      where: { username: 'pastis' },
      data: { password: hashedPassword, role: 'ADMIN' }
    });
    console.log('✅ Updated existing user "pastis" to ADMIN role.');
  } else {
    // Create new admin user
    await prisma.user.create({
      data: {
        username: 'pastis',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('✅ Created new ADMIN user: pastis');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
