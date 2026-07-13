import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string }
        });
        
        if (!user) return null;
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        
        if (!isPasswordValid) return null;
        
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks
  }
});
