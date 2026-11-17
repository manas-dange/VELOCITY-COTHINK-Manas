import { NextResponse } from "next/server";
import { submitAnswer } from "@/lib/cothink";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session, answer } = body;

    if (!session || typeof answer !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload. Must provide session and answer." },
        { status: 400 }
      );
    }

    const data = await submitAnswer({ session, answer });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to submit answer" },
      { status: 400 }
    );
  }
}
