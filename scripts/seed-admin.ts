
import { db } from '../src/db/connection';
import { adminUser } from '../src/db/schema';
import { pbkdf2Sync, randomBytes } from 'crypto';

async function seedAdmin() {
  const email = 'remcostoeten@hotmail.com';
  const password = 'Mhca6r4g1!';

  // Check if the user already exists
  const existingUser = await db.select().from(adminUser).where({ email });
  if (existingUser.length > 0) {
    console.log('Admin user already exists.');
    return;
  }

  // Hash the password
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  const passwordHash = `${salt}:${hashedPassword}`;

  // Insert the user
  await db.insert(adminUser).values({
    email,
    passwordHash,
    isActive: true,
  });

  console.log('Admin user created successfully.');
}

seedAdmin().catch((error) => {
  console.error('Failed to seed admin user:', error);
  process.exit(1);
});
