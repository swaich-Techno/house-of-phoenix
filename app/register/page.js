import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { getViewerFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const viewer = await getViewerFromRequest();

  if (viewer) {
    redirect("/");
  }

  return <AuthCard mode="register" />;
}
