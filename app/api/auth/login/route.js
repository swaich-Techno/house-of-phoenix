import { NextResponse } from "next/server";
import { attachSession, verifyPassword } from "@/lib/auth";
import { findUserByEmail, publicUser } from "@/lib/store";

export async function POST(request) {
  try {
    const payload = await request.json();
    const email = String(payload?.email || "").trim().toLowerCase();
    const password = String(payload?.password || "");
    const user = await findUserByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ user: publicUser(user) });
    return attachSession(response, user);
  } catch {
    return NextResponse.json(
      { error: "Unable to sign you in right now." },
      { status: 500 }
    );
  }
}
