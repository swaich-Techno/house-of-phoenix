import { NextResponse } from "next/server";
import { getViewerFromRequest } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/store";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products });
}

export async function POST(request) {
  const viewer = await getViewerFromRequest();

  if (!viewer || viewer.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const product = await createProduct(payload);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to create product." },
      { status: 400 }
    );
  }
}
