import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Profile | Heritage Motoring',
  description: 'View and manage your Heritage Motoring account',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin?callbackUrl=/account/profile');
  }
  
  return (
    <main className="py-10 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-medium mb-6">My Profile</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Account Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-medium">{session.user.name}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{session.user.email}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Account Type</p>
              <p className="font-medium capitalize">{session.user.role}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/myreservations" 
            className="inline-block px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            View My Reservations
          </Link>
          
          <Link 
            href="/account/change-password" 
            className="inline-block px-4 py-2 border border-[#8A7D55] text-[#8A7D55] rounded-md hover:bg-[#f8f5f0] transition-colors"
          >
            Change Password
          </Link>
        </div>
      </div>
    </main>
  );
}