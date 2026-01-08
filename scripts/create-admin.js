// İlk admin kullanıcısı oluşturma scripti
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const name = process.argv[2] || 'Admin User';
  const email = process.argv[3] || 'admin@example.com';
  const password = process.argv[4] || 'admin123';

  console.log('Creating admin user...');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);

  try {
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Admin kullanıcısı oluştur
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('\n❌ Error: User with this email already exists!');
    } else {
      console.error('\n❌ Error creating admin user:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();




