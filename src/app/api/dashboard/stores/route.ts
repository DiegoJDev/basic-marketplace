import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { storeCreateSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = 5;
  const [items, total] = await Promise.all([
    prisma.store.findMany({
      where: { ownerId: (session.user as { id: string }).id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.store.count({
      where: { ownerId: (session.user as { id: string }).id },
    }),
  ]);
  return NextResponse.json({
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
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
