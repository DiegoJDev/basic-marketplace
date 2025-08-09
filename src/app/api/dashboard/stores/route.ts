import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { storeCreateSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stores = await prisma.store.findMany({
    where: { ownerId: (session.user as { id: string }).id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json({ items: stores });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = storeCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name } = parsed.data;
  const store = await prisma.store.create({
    data: { name, ownerId: (session.user as { id: string }).id },
    select: { id: true, name: true },
  });
  return NextResponse.json(store, { status: 201 });
}
