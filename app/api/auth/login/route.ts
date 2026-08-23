import { NextResponse } from "next/server";
import { db } from "@/services/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required." },
        { status: 400 }
      );
    }

    const cleanId = String(identifier).trim();

    // Enforce @somaiya.edu domain for students and faculty
    if (role !== "admin" && cleanId !== "admin01") {
      if (!cleanId.toLowerCase().endsWith("@somaiya.edu")) {
        return NextResponse.json(
          { error: "Student and Faculty logins require a valid @somaiya.edu address." },
          { status: 400 }
        );
      }
    }

    const result = db.authenticate(cleanId, password, role);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Invalid username or password." },
        { status: 401 }
      );
    }

    const user = result.user;
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        name: user.displayName,
        username: user.username,
        email: user.email,
        role: user.role,
        programme: user.programme,
        year: user.year,
        department: user.department,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
