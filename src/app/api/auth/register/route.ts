import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerUserSchema } from "@/lib/schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return NextResponse.json(
      { error: "Already authenticated" },
      { status: 400 }
    );
  }
  const json = await request.json().catch(() => null);
  const parsed = registerUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { email, name, role } = parsed.data;

  const exists = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (exists) {
    return NextResponse.json(
      { error: "El email ya está registrado" },
      { status: 409 }
    );
  }

  await prisma.user.create({
    data: { email: email.toLowerCase(), name, role },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
