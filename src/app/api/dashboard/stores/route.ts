import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBusiness } from "@/lib/api-auth";
import { storeCreateSchema } from "@/lib/schemas";
import { PER_PAGE } from "@/lib/config";

export async function GET(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPageParam = searchParams.get("perPage");
  const all = perPageParam === "all";
  const perPage = all ? PER_PAGE : PER_PAGE;
  const [items, total] = await Promise.all([
    prisma.store.findMany({
      where: { ownerId: auth.userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      ...(all
        ? {}
        : {
            skip: (page - 1) * perPage,
            take: perPage,
          }),
    }),
    prisma.store.count({
      where: { ownerId: auth.userId },
    }),
  ]);
  if (all) {
    return NextResponse.json({
      items,
      total,
      page: 1,
      perPage: total,
      totalPages: 1,
    });
  }
  return NextResponse.json({
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
}

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
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
    data: { name, ownerId: auth.userId },
    select: { id: true, name: true },
  });
  return NextResponse.json(store, { status: 201 });
}
