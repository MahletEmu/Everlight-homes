import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { hashPassword } from "@/lib/auth/passwords";
import { signSessionToken } from "@/lib/auth/jwt";
import { getSessionCookieOptions } from "@/lib/auth/session";
import { RegisterSchema } from "@/lib/validation";
import { findMockUserByEmail, createMockUser } from "@/lib/auth/mockUserStore";
import { UserRole } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role, phone } = parsed.data;

    // Security: users cannot register as admin
    if ((role as string) === "admin") {
      return NextResponse.json(
        { error: "Admin role cannot be self-assigned" },
        { status: 403 }
      );
    }

    const passwordHash = await hashPassword(password);

    let createdUser: {
      _id: string | { toString(): string };
      name: string;
      email: string;
      role: UserRole;
      isVerified: boolean;
    };

    let dbAvailable = false;
    try {
      await connectToDatabase();
      dbAvailable = true;
    } catch {
      // Database offline/unreachable: gracefully fall back to local in-memory store
      dbAvailable = false;
    }

    if (dbAvailable) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email address already exists" },
          { status: 409 }
        );
      }

      const newUser = await User.create({
        name,
        email,
        passwordHash,
        role,
        phone,
        accountStatus: "active",
        isVerified: false,
      });

      createdUser = {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserRole,
        isVerified: newUser.isVerified,
      };
    } else {
      // In-Memory fallback mode when local MongoDB is not running
      const existingMock = findMockUserByEmail(email);
      if (existingMock) {
        return NextResponse.json(
          { error: "An account with this email address already exists" },
          { status: 409 }
        );
      }

      const mock = createMockUser({
        name,
        email,
        passwordHash,
        role: role as UserRole,
        phone,
      });

      createdUser = {
        _id: mock._id,
        name: mock.name,
        email: mock.email,
        role: mock.role,
        isVerified: mock.isVerified,
      };
    }

    const token = await signSessionToken({
      userId: createdUser._id.toString(),
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
      isVerified: createdUser.isVerified,
    });

    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json(
      {
        message: "Account registered successfully",
        user: {
          id: createdUser._id.toString(),
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          isVerified: createdUser.isVerified,
        },
      },
      { status: 201 }
    );

    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
