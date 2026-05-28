import NextAuth from "next-auth";
import { AuthOptions } from "next-auth"; // นำเข้า Type สำหรับความแม่นยำ
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

// แยก authOptions ออกมาเพื่อให้นำไปใช้ใน getServerSession ได้
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.riskdepart.findFirst({
          where: { depuser: credentials?.username }
        });

        if (user) {
          const dbPassword = String(user.deppass).toLowerCase().trim();
          const inputPassword = String(credentials?.password).trim();

          if (dbPassword === inputPassword) {
            // --- ปรับ Logic ตรงนี้ตามที่คุณระบุ ---
            // ถ้า deplevel เป็น '9' ให้เป็น ADMIN | ถ้าเป็น '0' ให้เป็น USER
            const userRole = String(user.deplevel) === "9" ? "ADMIN" : "USER";

            return { 
              id: String(user.depid), 
              name: user.depname ?? "", 
              department: user.depname ?? "", 
              role: userRole,
              deplevel: String(user.deplevel) // เก็บค่าตัวเลขไว้ด้วยเพื่อความชัวร์
            };
          }
        }
        return null;
      }
    })
  ],
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.department = user.department;
      token.deplevel = user.deplevel;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.department = token.department;
      session.user.deplevel = token.deplevel;
    }
    return session;
  },
},
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };