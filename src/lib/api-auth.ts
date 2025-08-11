// Minimal auth guards for API routes to reduce repetition
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth-options";

type Role = "CLIENT" | "BUSINESS";

type AuthOk = {
  session: Session;
  userId: string;
  role: Role | undefined;
};

type AuthFail = { error: NextResponse };

export async function requireAuth(): Promise<AuthOk | AuthFail> {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  const userId = (session.user as { id?: string }).id ?? "";
  const role = (session.user as { role?: Role }).role;
  return { session, userId, role };
}

export async function requireBusiness(): Promise<AuthOk | AuthFail> {
  const auth = await requireAuth();
  if ("error" in auth) return auth;
  if (auth.role !== "BUSINESS")
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  return auth;
}
