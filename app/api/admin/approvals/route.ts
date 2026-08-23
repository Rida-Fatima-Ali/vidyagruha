import { NextResponse } from "next/server";
import { db } from "@/services/database";

export async function GET() {
  try {
    const requests = db.getRegistrationRequests();
    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch registration requests." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId, action, adminName } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "requestId and action are required." },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const result = db.approveRequest(requestId, adminName || "System Administrator");
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "User registration approved and account activated.",
        user: result.user,
      });
    }

    if (action === "reject") {
      const result = db.rejectRequest(requestId, adminName || "System Administrator");
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "User registration request rejected.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update registration request." },
      { status: 500 }
    );
  }
}
