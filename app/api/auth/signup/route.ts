import { NextResponse } from "next/server";
import { db } from "@/services/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { displayName, email, role, password } = body;

    if (!displayName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Full Name, Email, Role, and Password are all required." },
        { status: 400 }
      );
    }

    if (role !== "student" && role !== "faculty") {
      return NextResponse.json(
        { error: "Only Student and Faculty roles are eligible for self-registration." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Backend domain enforcement
    if (!cleanEmail.endsWith("@somaiya.edu")) {
      return NextResponse.json(
        { error: "Registration is restricted to institutional accounts ending with @somaiya.edu" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    const result = db.createRegistrationRequest({
      displayName: String(displayName).trim(),
      email: cleanEmail,
      role,
      password,
    });

    if (!result.success || !result.request) {
      return NextResponse.json(
        { error: result.error || "Failed to submit registration request." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration request submitted for administrative review.",
        request: result.request,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred while processing registration." },
      { status: 500 }
    );
  }
}
