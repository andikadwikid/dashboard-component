
import type { NextAuthConfig } from "next-auth"
import Credentials from "@auth/core/providers/credentials";
import {LoginSchema} from "@/schema";
import {getUserByEmail} from "@/data/user";
import bcrypt from "bcryptjs";

export default {
    providers: [
        Credentials({
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials)

                if(validatedFields.success){
                   const {email, password} = validatedFields.data;

                    const user = await getUserByEmail(email);
                    if(!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if(passwordsMatch)  return user;
                }
                
                return null;
            },
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
} satisfies NextAuthConfig