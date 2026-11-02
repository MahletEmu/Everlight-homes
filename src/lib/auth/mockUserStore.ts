import { IUser, UserRole } from "@/types";
import bcrypt from "bcryptjs";

declare global {
  var mockUsersCache: Map<string, IUser & { passwordHash: string }> | undefined;
}

const mockUsers: Map<string, IUser & { passwordHash: string }> =
  global.mockUsersCache || new Map();

if (!global.mockUsersCache) {
  global.mockUsersCache = mockUsers;
}

// Pre-seed Default Administrator and Demo Accounts
const ADMIN_ID = "admin-master-id-1";
const LANDLORD_DEMO_ID = "landlord-bd-demo-1";
const TENANT_DEMO_ID = "tenant-bd-demo-1";

if (!mockUsers.has(ADMIN_ID)) {
  mockUsers.set(ADMIN_ID, {
    _id: ADMIN_ID,
    name: "Everlight Head Moderator",
    email: "admin@everlight.et",
    passwordHash: bcrypt.hashSync("EverlightAdmin2026!", 10),
    role: "admin",
    phone: "+251 911 000 001",
    accountStatus: "active",
    isVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
}

if (!mockUsers.has(LANDLORD_DEMO_ID)) {
  mockUsers.set(LANDLORD_DEMO_ID, {
    _id: LANDLORD_DEMO_ID,
    name: "Tewodros Kassahun",
    email: "landlord1@everlight.et",
    passwordHash: bcrypt.hashSync("Password123!", 10),
    role: "landlord",
    phone: "+251 911 223 344",
    accountStatus: "active",
    isVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
}

if (!mockUsers.has(TENANT_DEMO_ID)) {
  mockUsers.set(TENANT_DEMO_ID, {
    _id: TENANT_DEMO_ID,
    name: "Yonas Mekonnen",
    email: "tenant1@everlight.et",
    passwordHash: bcrypt.hashSync("Password123!", 10),
    role: "tenant",
    phone: "+251 933 889 900",
    accountStatus: "active",
    isVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
}

export function findMockUserByEmail(email: string): (IUser & { passwordHash: string }) | null {
  const normalized = email.toLowerCase().trim();
  for (const user of mockUsers.values()) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

export function findMockUserById(id: string): (IUser & { passwordHash: string }) | null {
  return mockUsers.get(id) || null;
}

export function createMockUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
}): IUser & { passwordHash: string } {
  const id = "user-mock-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const newUser: IUser & { passwordHash: string } = {
    _id: id,
    name: data.name,
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    role: data.role,
    phone: data.phone || "",
    accountStatus: "active",
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockUsers.set(id, newUser);
  return newUser;
}
