import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }
  if (session.user.role !== "BUSINESS") {
    redirect("/");
  }
  // If the middleware is active, here you will have a BUSINESS
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-2">Bienvenido, {session?.user?.email}</p>
      <p className="text-sm text-neutral-500">Rol: {session?.user?.role}</p>
    </div>
  );
}
