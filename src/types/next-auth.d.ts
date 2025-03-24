// src/types/next-auth.d.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id?: string,  // Optional id from NextAuth
      _id: string,  // MongoDB ObjectId
      name: string,
      email: string,
      role: string,
      token: string
    }
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string,     // Required by NextAuth
    _id?: string,   // MongoDB ObjectId (may be the same as id)
    name: string,
    email: string,
    role: string,
    token: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    _id: string,    // MongoDB ObjectId
    name: string,
    email: string,
    role: string,
    token: string
  }
}