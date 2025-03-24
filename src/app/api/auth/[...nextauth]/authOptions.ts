import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogin from "@/libs/userLogIn";
import getUserProfile from "@/libs/getUserProfile";
import { JWT } from "next-auth/jwt";

// Define a custom User type that extends the NextAuth User type
interface CustomUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  telephone_number?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          // Login user and get token
          const loginResult = await userLogin(credentials.email, credentials.password);
          
          if (!loginResult?.success || !loginResult?.token) {
            return null;
          }
          
          // Fetch user profile with token
          const userProfile = await getUserProfile(loginResult.token);
          
          // Return user data with token
          return {
            id: userProfile.data._id,
            _id: userProfile.data._id,
            name: userProfile.data.name,
            email: userProfile.data.email,
            role: userProfile.data.role,
            token: loginResult.token,
            telephone_number: userProfile.data.telephone_number
          } as CustomUser;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/signin',
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      // Add user data to JWT when signing in
      if (user) {
        const customUser = user as CustomUser;
        token._id = customUser._id;
        token.name = customUser.name;
        token.email = customUser.email;
        token.role = customUser.role;
        token.token = customUser.token;
        
        // Only add telephone_number if it exists
        if (customUser.telephone_number) {
          token.telephone_number = customUser.telephone_number;
        }
      }
      return token;
    },
    session({ session, token }) {
      // Add token data to the session
      if (token && session.user) {
        // Ensure these fields exist in your next-auth.d.ts Session interface
        session.user._id = token._id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.token = token.token as string;
        
        // Safely add telephone_number using type assertion
        if (token.telephone_number) {
          (session.user as any).telephone_number = token.telephone_number;
        }
      }
      return session;
    },
  }
};