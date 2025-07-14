import { db } from '@/db/db';
import { users } from '@/db/schemas/users';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'password123';
  const name = 'Test User';

  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('Test user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
      })
      .returning();

    console.log('Test user created successfully:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', newUser.id);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
