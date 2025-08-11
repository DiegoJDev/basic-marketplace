"use client";

import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccessDeniedPage() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/";
  const { data: session } = useSession();
  const role = (session?.user as { role?: "CLIENT" | "BUSINESS" } | undefined)
    ?.role;

  return (
    <div className="py-10">
      <Container>
        <div className="max-w-lg rounded-2xl border p-6 bg-white">
          <h1 className="text-xl font-semibold">Access restricted</h1>
          <p className="mt-2 text-sm text-gray-700">
            {role === "BUSINESS"
              ? "Las secciones de tiendas y productos están disponibles solo para clientes."
              : "No tienes acceso a esta sección."}
          </p>
          <p className="mt-1 text-xs text-gray-500">Ruta: {from}</p>
          <div className="mt-6 flex items-center gap-2">
            <Button onClick={() => signOut({ callbackUrl: "/sign-in" })}>
              Sign out & sign in as client
            </Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
