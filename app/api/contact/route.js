import { NextResponse } from "next/server";
import { saveInquiry } from "@/lib/store";

export async function POST(request) {
  try {
    const payload = await request.json();
    const inquiry = await saveInquiry(payload);
    return NextResponse.json({ inquiry });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to send your message." },
      { status: 400 }
    );
  }
}
