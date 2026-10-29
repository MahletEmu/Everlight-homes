import { IUser, UserRole } from "@/types";

declare global {
  var mockUsersCache: Map<string, IUser & { passwordHash: string }> | undefined;
}

const mockUsers: Map<string, IUser & { passwordHash: string }> =
  global.mockUsersCache || new Map();

if (!global.mockUsersCache) {
  global.mockUsersCache = mockUsers;
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

