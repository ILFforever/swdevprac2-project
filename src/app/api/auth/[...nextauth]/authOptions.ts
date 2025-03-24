import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogin from "@/libs/userLogIn";
import getUserProfile from "@/libs/getUserProfile";
import { JWT } from "next-auth/jwt";
import { User } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email" },
                password: { label: "Password", type: "password" }
            },
            
            async authorize(credentials, req) {
                if (!credentials) return null;

                try {
                    // Attempt to log in the user
                    const user = await userLogin(credentials.email, credentials.password);
                    
                    if (user && user.success && user.token) {
                        // Fetch additional user profile data using the token
                        const userProfile = await getUserProfile(user.token);
                        
                        // Return combined user data with token
                        return {
                            _id: userProfile.data._id,
                            name: userProfile.data.name,
                            email: userProfile.data.email,
                            role: userProfile.data.role,
                            token: user.token
                        } as User;
                    }
                    return null;
                } catch (error) {
                    // Handle login errors
                    console.error("Authentication error:", error);
                    throw new Error(error instanceof Error ? error.message : "Invalid credentials");
                }
            }
        })
    ],
    pages: {
        signIn: '/signin',
    },
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token._id = user._id;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.token = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user._id = token._id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.token = token.token;
            }
            return session;
        },
    }
};