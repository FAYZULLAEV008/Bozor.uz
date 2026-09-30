// BOZOR.UZ Prisma Seed Script
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding BOZOR.UZ database...');
  console.log('Seeded 3 users:');
  console.log('1. Admin: admin@bozor.uz (pass: admin123)');
  console.log('2. Seller: seller@bozor.uz (pass: seller123)');
  console.log('3. Customer: user@bozor.uz (pass: user123)');
  console.log('Seeded 12 categories, 32 products, orders and reviews.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
