import { NextResponse } from "next/server";
import { getViewerFromRequest } from "@/lib/auth";
import {
  addCartItem,
  clearCart,
  getCartForUser,
  removeCartItem,
  setCartQuantity
} from "@/lib/store";

async function requireViewer() {
  const viewer = await getViewerFromRequest();

  if (!viewer) {
    return null;
  }

  return viewer;
}

export async function GET() {
  const viewer = await requireViewer();

  if (!viewer) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const cart = await getCartForUser(viewer.id);
  return NextResponse.json({ cart });
}

export async function POST(request) {
  const viewer = await requireViewer();

  if (!viewer) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const cart = await addCartItem(viewer.id, payload?.productId, payload?.quantity || 1);
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to add product to cart." },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  const viewer = await requireViewer();

  if (!viewer) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const cart = await setCartQuantity(viewer.id, payload?.productId, payload?.quantity);
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to update cart." },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const viewer = await requireViewer();

  if (!viewer) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const shouldClear = searchParams.get("clear") === "1";

  const cart = shouldClear
    ? await clearCart(viewer.id)
    : await removeCartItem(viewer.id, searchParams.get("productId"));

  return NextResponse.json({ cart });
}
