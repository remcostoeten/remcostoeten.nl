const { createClient } = require("@libsql/client");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

// Load environment variables
require("dotenv").config();

async function createUser() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const email = "remcostoeten@hotmail.com";
  const password = "admin123456"; // Change this to your preferred password
  const name = "Remco Stoeten";

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = nanoid();

    // Insert user into the database
    await client.execute({
      sql: `INSERT INTO users (id, email, name, emailVerified, image, createdAt, updatedAt) VALUES (?, ?, ?, NULL, NULL, ?, ?)`,
      args: [userId, email, name, new Date().toISOString(), new Date().toISOString()],
    });

    console.log("✅ User created successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${name}`);
    console.log("\nYou can now log in with these credentials at http://localhost:3000/auth/signin");

  } catch (error) {
    console.error("❌ Error creating user:", error.message);
  } finally {
    client.close();
  }
}

createUser();
