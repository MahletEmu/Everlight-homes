import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { findMockUserById } from "@/lib/auth/mockUserStore";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    try {
      await connectToDatabase();
      const user = await User.findById(session.userId).select("-passwordHash");
      if (user) {
        return NextResponse.json({
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            accountStatus: user.accountStatus,
            isVerified: user.isVerified,
            avatarUrl: user.avatarUrl,
          },
        });
      }
    } catch {
      // MongoDB is offline; proceed to fallback below
    }

    // In-memory or session payload fallback
    const mock = findMockUserById(session.userId);
    return NextResponse.json({
      user: {
        id: session.userId,
        name: mock?.name || session.name,
        email: mock?.email || session.email,
        phone: mock?.phone || "",
        role: mock?.role || session.role,
        accountStatus: mock?.accountStatus || "active",
        isVerified: mock ? mock.isVerified : session.isVerified,
        avatarUrl: mock?.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
