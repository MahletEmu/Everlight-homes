import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { verifyPassword } from "@/lib/auth/passwords";
import { signSessionToken } from "@/lib/auth/jwt";
import { getSessionCookieOptions } from "@/lib/auth/session";
import { LoginSchema } from "@/lib/validation";
import { findMockUserByEmail } from "@/lib/auth/mockUserStore";
import { UserRole } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials format" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    let targetUser: {
      _id: string | { toString(): string };
      name: string;
      email: string;
      role: UserRole;
      passwordHash: string;
      accountStatus: string;
      isVerified: boolean;
    } | null = null;

    let dbAvailable = false;
    try {
      await connectToDatabase();
      dbAvailable = true;
    } catch {
      dbAvailable = false;
    }

    if (dbAvailable) {
      // Explicitly select passwordHash
      const user = await User.findOne({ email }).select("+passwordHash");
      if (user && user.passwordHash) {
        targetUser = {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          passwordHash: user.passwordHash,
          accountStatus: user.accountStatus,
          isVerified: user.isVerified,
        };
      }
    } else {
      // Offline fallback: check in-memory store
      const mock = findMockUserByEmail(email);
      if (mock) {
        targetUser = {
          _id: mock._id,
          name: mock.name,
          email: mock.email,
          role: mock.role,
          passwordHash: mock.passwordHash,
          accountStatus: mock.accountStatus,
          isVerified: mock.isVerified,
        };
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (targetUser.accountStatus === "suspended") {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact Everlight support." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, targetUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      userId: targetUser._id.toString(),
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      isVerified: targetUser.isVerified,
    });

    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({
      message: "Signed in successfully",
      user: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isVerified: targetUser.isVerified,
      },
    });

    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign in" },
      { status: 500 }
    );
  }
}
