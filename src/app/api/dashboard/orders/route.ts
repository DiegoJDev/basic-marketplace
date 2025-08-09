import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Math.min(
    50,
    Math.max(1, Number(searchParams.get("perPage") || 12))
  );
  const status = searchParams.get("status") || undefined;

  const stores = await prisma.store.findMany({
    where: { ownerId: (session.user as { id: string }).id },
    select: { id: true },
  });
  const storeIds = stores.map((s) => s.id);

  const where = {
    product: { storeId: { in: storeIds } },
    ...(status ? { status: status as any } : {}),
  } as const;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        quantity: true,
        status: true,
        user: { select: { email: true } },
        product: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
}
