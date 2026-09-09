import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, waitlistSignups } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
const fallbackWaitlist = new Set<string>();

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWaitlistCount() {
  const db = await getDb();
  if (!db) return fallbackWaitlist.size;

  try {
    const result = await db.select({ total: count(waitlistSignups.id) }).from(waitlistSignups);
    return Number(result[0]?.total ?? 0);
  } catch (error) {
    console.warn("[Waitlist] Falling back to in-memory count:", error);
    return fallbackWaitlist.size;
  }
}

export async function addWaitlistSignup(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const db = await getDb();

  if (!db) {
    if (fallbackWaitlist.has(normalizedEmail)) return { duplicate: true };
    fallbackWaitlist.add(normalizedEmail);
    return { duplicate: false };
  }

  try {
    const existing = await db
      .select({ id: waitlistSignups.id })
      .from(waitlistSignups)
      .where(eq(waitlistSignups.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) return { duplicate: true };
    await db.insert(waitlistSignups).values({ email: normalizedEmail });
    return { duplicate: false };
  } catch (error) {
    // A unique constraint race is still a successful duplicate response, not a 500.
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("duplicate") || message.includes("unique")) return { duplicate: true };
    console.warn("[Waitlist] Database unavailable, using in-memory fallback:", error);
    if (fallbackWaitlist.has(normalizedEmail)) return { duplicate: true };
    fallbackWaitlist.add(normalizedEmail);
    return { duplicate: false };
  }
}
