import { db } from '@/db/db';
import { users } from '@/db/schemas/users';
import { verifyPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

async function debugAuth() {
  const email = 'test@example.com';
  const password = 'password123';

  try {
    console.log('Debugging authentication...');
    
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0,
    });

    // Test password verification
    const isValid = await verifyPassword(password, user.password);
    console.log('Password verification result:', isValid);

    // Check all users in database
    const allUsers = await db.select().from(users);
    console.log('All users in database:', allUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      hasPassword: !!u.password,
    })));

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugAuth();
