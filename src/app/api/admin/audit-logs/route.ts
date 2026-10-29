import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AuditLog } from "@/lib/models";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireRole(["admin"]);
    await connectToDatabase();

    const logs = await AuditLog.find()
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "FORBIDDEN" || (error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Administrator authorization required" }, { status: 403 });
    }
    console.error("Audit logs error:", error);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
