// src/app/admin/manageReservations/page.tsx
'use client';

import { Suspense, lazy } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';

// Lazy load the ReservationManagement component
const ReservationManagement = lazy(() => import('@/components/ReservationManagement'));

// Loading component
const LoadingComponent = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
      <span className="ml-3">Loading reservation management...</span>
    </div>
  </div>
);

export default function ManageReservationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Check if the session is loading
  if (status === 'loading') {
    return (
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-medium mb-6 text-center">Manage Reservations</h1>
        <LoadingComponent />
      </main>
    );
  }
  
  // Redirect if not logged in or not an admin
  if (!session || session.user.role !== 'admin') {
    router.push('/');
    return null;
  }
  
  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-medium mb-6 text-center">Manage Reservations</h1>
      <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
        View, create, or deactivate reservations from this management dashboard.
      </p>
      
      {session?.user?.token ? (
        <Suspense fallback={<LoadingComponent />}>
          <ReservationManagement token={session.user.token} />
        </Suspense>
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
          Authentication token not available. Please try logging out and back in.
        </div>
      )}
    </main>
  );
}