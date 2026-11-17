import { NextResponse } from "next/server";
import { generateNow } from "@/lib/cothink";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session } = body;

    if (!session) {
      return NextResponse.json(
        { error: "Invalid request payload. Must provide session." },
        { status: 400 }
      );
    }

    const data = await generateNow({ session });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate summary now" },
      { status: 400 }
    );
  }
}
