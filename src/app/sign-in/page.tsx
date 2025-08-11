"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await signIn("credentials", { email, redirect: false });
      if (res?.ok) {
        const session = await getSession();
        const role = (
          session?.user as { role?: "CLIENT" | "BUSINESS" } | null | undefined
        )?.role;
        if (callbackUrl && role !== "BUSINESS") {
          router.replace(callbackUrl);
        } else {
          router.replace(role === "BUSINESS" ? "/dashboard" : "/");
        }
      } else if (res?.error) {
        setErrorMessage("No pudimos iniciar sesión con ese email.");
      } else {
        setErrorMessage("Ocurrió un error inesperado.");
      }
    } catch {
      setErrorMessage("Error de red o del servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border p-4 space-y-4"
      >
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        <label className="block space-y-2">
          <span className="text-sm">Email</span>
          <input
            className="w-full rounded-md border px-3 py-2 outline-none"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
          />
        </label>
        {errorMessage ? (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-black text-white py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Ingresando..." : "Continuar"}
        </button>

        <p className="text-sm text-center text-neutral-600">
          ¿No tienes una cuenta?{" "}
          <a
            href={`/sign-up${
              callbackUrl
                ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : ""
            }`}
            className="underline"
          >
            Crear una
          </a>
        </p>

        <p className="text-xs text-neutral-500">
          Tip: Usa <b>client@example.com</b> (rol CLIENT) o{" "}
          <b>business@example.com</b> (rol BUSINESS, creado en tu seed).
        </p>
      </form>
    </div>
  );
}
