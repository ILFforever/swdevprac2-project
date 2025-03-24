import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import getUserReservations from '@/libs/getUserReservations';
import { Reservation } from '@/types/dataTypes';

export const metadata: Metadata = {
  title: 'My Reservations | Heritage Motoring',
  description: 'View your vehicle reservations',
};

export default async function MyReservationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin?callbackUrl=/myreservations');
  }
  
  // Fetch the user's reservations using the token
  let reservations: Reservation[] = [];
  try {
    const response = await getUserReservations(session.user.token);
    reservations = response.data || [];
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    // Provide empty array if fetch fails
    reservations = [];
  }
  
  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-medium">My Reservations</h1>
        
        <Link 
          href="/booking" 
          className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
        >
          Make New Reservation
        </Link>
      </div>
      
      {reservations.length === 0 ? (
        <div className="bg-white p-10 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-6">You don't have any reservations yet.</p>
          <Link 
            href="/venue" 
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Browse Available Vehicles
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation: Reservation) => (
                <tr key={reservation._id || reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.vehicleName || 
                        (typeof reservation.venue === 'object' ? reservation.venue.name : 'Vehicle')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link 
                      href={`/myreservations/${reservation._id || reservation.id}`}
                      className="text-[#8A7D55] hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}