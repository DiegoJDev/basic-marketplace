"use client";

import Button from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema, type RegisterUserInput } from "@/lib/schemas";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserInput>({ resolver: zodResolver(registerUserSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body?.error ?? "Error al registrar");
      return;
    }
    // Auto login y redirección por rol
    const si = await signIn("credentials", {
      email: values.email,
      redirect: false,
    });
    if (!si?.ok) {
      setServerError("No pudimos iniciar sesión automáticamente");
      return;
    }
    if (callbackUrl && values.role !== "BUSINESS") {
      router.replace(callbackUrl);
    } else if (values.role === "BUSINESS") {
      router.replace("/dashboard/stores");
    } else {
      router.replace("/");
    }
  });

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border p-4 space-y-4 -mt-12 md:-mt-16"
      >
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
        {serverError ? (
          <p className="text-sm text-red-600" role="alert">
            {serverError}
          </p>
        ) : null}
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm">Nombre</label>
          <input
            type="text"
            {...register("name")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.name ? (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm">Rol</label>
          <select
            {...register("role")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Selecciona un rol</option>
            <option value="CLIENT">Cliente</option>
            <option value="BUSINESS">Negocio</option>
          </select>
          {errors.role ? (
            <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
          ) : null}
        </div>
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
