import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export const metadata: Metadata = {
  title: 'Sign In | Heritage Motoring',
  description: 'Sign in to your Heritage Motoring account',
};

interface PageProps {
  searchParams?: { callbackUrl?: string };
}

export default async function SignInPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  
  // If user is already signed in, redirect to the callback URL or home page
  if (session) {
    const callbackUrl = searchParams?.callbackUrl || '/';
    redirect(callbackUrl);
  }
  
  const callbackUrl = searchParams?.callbackUrl || '/';

  return (
    <main className="py-10 px-4">
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}