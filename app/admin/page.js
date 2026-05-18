import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { getViewerFromRequest } from "@/lib/auth";
import {
  getDatabaseConnectionIssue,
  isDatabaseConfigured
} from "@/lib/mongodb";
import { listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const viewer = await getViewerFromRequest();

  if (!viewer) {
    redirect("/login?next=/admin");
  }

  if (viewer.role !== "admin") {
    redirect("/");
  }

  const products = await listProducts();

  return (
    <AdminDashboard
      databaseIssue={getDatabaseConnectionIssue()}
      initialProducts={products}
      databaseConfigured={isDatabaseConfigured()}
    />
  );
}
