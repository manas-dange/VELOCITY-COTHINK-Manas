import { NextResponse } from "next/server";
import { correctAnswer } from "@/lib/cothink";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session, turnId, newAnswer } = body;

    if (!session || !turnId || typeof newAnswer !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload. Must provide session, turnId, and newAnswer." },
        { status: 400 }
      );
    }

    const data = await correctAnswer({ session, turnId, newAnswer });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to correct answer" },
      { status: 400 }
    );
  }
}
