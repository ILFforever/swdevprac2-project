// src/types/next-auth.d.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module "next-auth" {

  interface Session {
    user: {
      id?: string,  // Optional id from NextAuth
      _id: string,  // MongoDB ObjectId
      name: string,
      email: string,
      role: string,
      token: string,
      telephone_number: string  // Add telephone_number here
    }
  }


  interface User {
    id: string,     // Required by NextAuth
    _id?: string,   // MongoDB ObjectId (may be the same as id)
    name: string,
    email: string,
    role: string,
    token: string,
    telephone_number: string  // Add telephone_number here
  }
}

declare module "next-auth/jwt" {

  interface JWT {
    _id: string,    // MongoDB ObjectId
    name: string,
    email: string,
    role: string,
    token: string,
    telephone_number: string  // Add telephone_number here
  }
}