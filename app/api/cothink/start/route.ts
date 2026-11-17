import { NextResponse } from "next/server";
import { startSession } from "@/lib/cothink";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { initialIntent } = body;
    const data = await startSession({ initialIntent });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to start session" },
      { status: 400 }
    );
  }
}
