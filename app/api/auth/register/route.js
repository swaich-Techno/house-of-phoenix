import { NextResponse } from "next/server";
import { attachSession, hashPassword } from "@/lib/auth";
import { createUser, publicUser, resolveUserRole } from "@/lib/store";

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = String(payload?.name || "").trim();
    const email = String(payload?.email || "").trim().toLowerCase();
    const password = String(payload?.password || "");

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: "Name, email, and a password of at least 6 characters are required." },
        { status: 400 }
      );
    }

    const user = await createUser({
      name,
      email,
      passwordHash: hashPassword(password),
      role: resolveUserRole(email)
    });

    const response = NextResponse.json({ user: publicUser(user) });
    return attachSession(response, user);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to create your account right now." },
      { status: 400 }
    );
  }
}
