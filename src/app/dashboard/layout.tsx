import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }
  if ((session.user as { role?: "CLIENT" | "BUSINESS" }).role !== "BUSINESS") {
    redirect("/");
  }
  return <>{children}</>;
}
