import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@/types";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
}

const DEFAULT_SECRET = "everlight-default-dev-secret-replace-in-env-32-chars-long";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getJwtSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      isVerified: Boolean(payload.isVerified),
    };
  } catch {
    return null;
  }
}
