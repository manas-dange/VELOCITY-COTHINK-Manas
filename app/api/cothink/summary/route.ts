import { NextResponse } from "next/server";
import { updateSummary } from "@/lib/cothink";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session, edits } = body;

    if (!session || !edits) {
      return NextResponse.json(
        { error: "Invalid request payload. Must provide session and edits." },
        { status: 400 }
      );
    }

    const data = await updateSummary({ session, edits });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update summary" },
      { status: 400 }
    );
  }
}
