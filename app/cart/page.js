import { redirect } from "next/navigation";
import CartClient from "@/components/CartClient";
import { getViewerFromRequest } from "@/lib/auth";
import { getCartForUser } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const viewer = await getViewerFromRequest();

  if (!viewer) {
    redirect("/login?next=/cart");
  }

  const cart = await getCartForUser(viewer.id);

  return <CartClient initialCart={cart} viewer={viewer} />;
}
