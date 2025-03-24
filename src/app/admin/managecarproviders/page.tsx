'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import CarProvider from '@/components/CarProvider';

const Page: React.FC = () => {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div className="container mx-auto p-6">Loading session...</div>;
  }

  if (status === 'unauthenticated' || !session) {
    return <div className="container mx-auto p-6">You must be logged in to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Car Providers List</h1>
      {/* Now we can safely pass the token */}
      <CarProvider token={session.user.token} />
    </div>
  );
};

export default Page;