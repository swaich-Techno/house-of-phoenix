import { NextResponse } from "next/server";
import { getViewerFromRequest } from "@/lib/auth";

export async function GET() {
  const viewer = await getViewerFromRequest();
  return NextResponse.json({ user: viewer });
}
