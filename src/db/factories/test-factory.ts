import { db } from "../connection";
import { projects } from "../schema";
import type { TProject } from "../schema";

type TTestFactory = {
  read: () => Promise<TProject[]>;
  testConnection: () => Promise<boolean>;
};

export function createTestFactory(): TTestFactory {
  async function read(): Promise<TProject[]> {
    try {
      const result = await db.select().from(projects).limit(5);
      return result;
    } catch (error) {
      console.error("Error reading projects:", error);
      return [];
    }
  }

  async function testConnection(): Promise<boolean> {
    try {
      await db.select().from(projects).limit(1);
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  }

  return {
    read,
    testConnection,
  };
}
