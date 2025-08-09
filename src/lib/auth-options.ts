import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Email only",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        if (!email) return null;

        // Look for email; if not found, create as CLIENT (simple login/registration)
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: { email, role: "CLIENT" },
          });
        }

        // NextAuth only needs to return an object with id/email/name/role
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When logging in, copy id/role to token
      if (user) {
        const u = user as { id: string; role: "CLIENT" | "BUSINESS" };
        (token as { id?: string; role?: "CLIENT" | "BUSINESS" }).id = u.id;
        (token as { id?: string; role?: "CLIENT" | "BUSINESS" }).role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose id/role in session.user
      if (session.user) {
        const t = token as { id?: string; role?: "CLIENT" | "BUSINESS" };
        (session.user as { id?: string; role?: "CLIENT" | "BUSINESS" }).id =
          t.id;
        (session.user as { id?: string; role?: "CLIENT" | "BUSINESS" }).role =
          t.role;
      }
      return session;
    },
  },
  pages: {
    // for NextAuth redirects (even with App Router)
    signIn: "/sign-in",
  },
};
