import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { findUserById, publicUser } from "./store";

const SESSION_COOKIE = "house-of-phoenix-session";
const SESSION_TTL = 60 * 60 * 24 * 7;
const FALLBACK_SECRET = "house-of-phoenix-local-secret";

function getSecret() {
  return process.env.JWT_SECRET || FALLBACK_SECRET;
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedPasswordHash) {
  if (!storedPasswordHash || !storedPasswordHash.includes(":")) {
    return false;
  }

  const [salt, expectedHash] = storedPasswordHash.split(":");
  const computedHash = scryptSync(password, salt, 64).toString("hex");

  return timingSafeEqual(
    Buffer.from(computedHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}

function signTokenPart(encodedPayload) {
  return createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createSessionToken(user) {
  const encodedPayload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + SESSION_TTL * 1000
    })
  ).toString("base64url");

  return `${encodedPayload}.${signTokenPart(encodedPayload)}`;
}

export function readSessionToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (signTokenPart(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );

    if (!payload?.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function attachSession(response, user) {
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL,
    path: "/"
  });

  return response;
}

export function clearSession(response) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/"
  });

  return response;
}

export async function getViewerFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = readSessionToken(token);

  if (!payload?.id) {
    return null;
  }

  const user = await findUserById(payload.id);
  return publicUser(user);
}
