import { NextResponse } from "next/server";
import { getViewerFromRequest } from "@/lib/auth";
import { deleteProduct, updateProduct } from "@/lib/store";

export async function PUT(request, { params }) {
  const viewer = await getViewerFromRequest();

  if (!viewer || viewer.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const payload = await request.json();
    const product = await updateProduct(id, payload);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to update product." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const viewer = await getViewerFromRequest();

  if (!viewer || viewer.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
