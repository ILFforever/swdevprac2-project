import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogin from "@/libs/userLogIn";
import getUserProfile from "@/libs/getUserProfile";
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
            console.log('authorize: Attempting to log in with credentials');
            
            // Attempt to log in the user
            const loginResult = await userLogin(credentials.email, credentials.password);
            
            if (loginResult && loginResult.success && loginResult.token) {
              console.log('Login successful, fetching user profile');
              
              try {
                // Fetch additional user profile data using the token
                const userProfile = await getUserProfile(loginResult.token);
                
                console.log('User profile fetched:', userProfile);
                
                // Return combined user data with token
                // Make sure to include 'id' property which NextAuth requires
                return {
                  id: userProfile.data._id, // NextAuth requires 'id' property
                  _id: userProfile.data._id,
                  name: userProfile.data.name,
                  email: userProfile.data.email,
                  role: userProfile.data.role,
                  token: loginResult.token
                } as User;
              } catch (profileError) {
                console.error('Error fetching user profile:', profileError);
                
                // If we can't fetch the profile but login was successful,
                // return minimal user data with required 'id' property
                return {
                  id: 'unknown', // NextAuth requires 'id' property
                  email: credentials.email,
                  token: loginResult.token,
                  name: 'User', // Default name
                  role: 'user', // Default role
                  _id: 'unknown'
                } as User;
              }
            }
            
            console.log('Login failed or token missing');
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
          console.log('JWT callback with user:', user);
          token._id = user._id || user.id; // Fallback to id if _id is not available
          token.name = user.name;
          token.email = user.email;
          token.role = user.role;
          token.token = user.token;
        }
        return token;
      },
      async session({ session, token }) {
        console.log('Session callback with token:', token);
        if (token && session.user) {
          session.user._id = token._id;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.role = token.role || 'user'; // Provide default role if missing
          session.user.token = token.token;
        }
        return session;
      },
    },
    debug: process.env.NODE_ENV === 'development',
  };