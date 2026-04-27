import { db, users, type User } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface NewAuthUser {
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: NewAuthUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalized = email.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalized));
    return user;
  }

  async createUser(input: NewAuthUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: input.email.trim().toLowerCase(),
        passwordHash: input.passwordHash,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
