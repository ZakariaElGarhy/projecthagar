import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { Request, Response } from "express";
import { db, adminUsersTable, sessionsTable } from "@workspace/db";

const SESSION_COOKIE = "sid";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const DEFAULT_USERNAME = process.env.ADMIN_USERNAME ?? "editor";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD ?? "linenandloam";

function hashPassword(password: string): string {
  const salt = process.env.SESSION_SECRET ?? "home-decor-dev-salt";
  return scryptSync(password, salt, 64).toString("hex");
}

function signSessionId(id: string): string {
  const secret = process.env.SESSION_SECRET ?? "home-decor-dev-secret";
  const signature = createHmac("sha256", secret).update(id).digest("hex");
  return `${id}.${signature}`;
}

function verifySessionId(value: string): string | null {
  const [id, signature] = value.split(".");
  if (!id || !signature) return null;
  const expected = createHmac("sha256", process.env.SESSION_SECRET ?? "home-decor-dev-secret")
    .update(id)
    .digest("hex");
  if (signature.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? id : null;
}

export async function ensureAdminUser(): Promise<void> {
  const existing = await db
    .select({ id: adminUsersTable.id })
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, DEFAULT_USERNAME))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(adminUsersTable).values({
      username: DEFAULT_USERNAME,
      passwordHash: hashPassword(DEFAULT_PASSWORD),
      role: "admin",
    });
  }
}

export async function createSession(userId: number, response: Response): Promise<void> {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessionsTable).values({ id, userId, expiresAt });
  response.cookie(SESSION_COOKIE, signSessionId(id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession(request: Request, response: Response): Promise<void> {
  const raw = request.cookies?.[SESSION_COOKIE];
  const id = typeof raw === "string" ? verifySessionId(raw) : null;
  if (id) await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
  response.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function getSessionUser(request: Request) {
  const raw = request.cookies?.[SESSION_COOKIE];
  const id = typeof raw === "string" ? verifySessionId(raw) : null;
  if (!id) return null;
  const rows = await db
    .select({
      username: adminUsersTable.username,
      role: adminUsersTable.role,
    })
    .from(sessionsTable)
    .innerJoin(adminUsersTable, eq(adminUsersTable.id, sessionsTable.userId))
    .where(and(eq(sessionsTable.id, id), gt(sessionsTable.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export function passwordMatches(password: string, passwordHash: string): boolean {
  const actual = Buffer.from(hashPassword(password), "hex");
  const expected = Buffer.from(passwordHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export { DEFAULT_PASSWORD, DEFAULT_USERNAME };