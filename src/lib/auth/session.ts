import { cookies } from "next/headers";
import { verifySessionToken, SessionPayload } from "./jwt";
import { UserRole } from "@/types";

export const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "everlight_session";

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionPayload> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}
