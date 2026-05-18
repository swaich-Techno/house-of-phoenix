import StorefrontPage from "@/components/StorefrontPage";
import { getViewerFromRequest } from "@/lib/auth";
import {
  getDatabaseConnectionIssue,
  isDatabaseConfigured
} from "@/lib/mongodb";
import { listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [viewer, products] = await Promise.all([
    getViewerFromRequest(),
    listProducts()
  ]);

  return (
    <StorefrontPage
      databaseIssue={getDatabaseConnectionIssue()}
      products={products}
      viewer={viewer}
      databaseConfigured={isDatabaseConfigured()}
    />
  );
}
