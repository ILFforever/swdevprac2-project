'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { getTierName } from '@/utils/tierUtils';
import { API_BASE_URL } from '@/config/apiConfig';

export default function ReservationDetailsPage({ 
  params 
}: { 
  params: { reservationId: string } 
}) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // State for reservation data and loading
  const [reservation, setReservation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reservation details
  useEffect(() => {
    async function fetchReservationDetails() {
      // Check if session exists
      if (!session?.user?.token) {
        router.push('/signin?callbackUrl=/account/reservations');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/rents/${params.reservationId}`, {
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reservation details');
        }

        const data = await response.json();
        setReservation(data.data);
      } catch (err) {
        console.error('Error fetching reservation details:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReservationDetails();
  }, [params.reservationId, session?.user?.token, router]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };


  const handleDeleteReservation = (id) => {
    // Logic to delete the reservation, e.g., API call
    console.log(`Deleting reservation with ID: ${id}`);
    // Update your state or notify the backend
  };

  // Calculate rental period
  const calculateRentalPeriod = (startDate: string, returnDate: string) => {
    const start = new Date(startDate);
    const end = new Date(returnDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return days;
  };

  // Calculate late days and fees
  const calculateLateFees = (reservation: any) => {
    if (!reservation.actualReturnDate) return { daysLate: 0, lateFeePerDay: 0, totalLateFee: 0 };

    const expectedReturnDate = new Date(reservation.returnDate);
    const actualReturnDate = new Date(reservation.actualReturnDate);
    
    const daysLate = Math.max(0, Math.ceil((actualReturnDate.getTime() - expectedReturnDate.getTime()) / (1000 * 3600 * 24)));
    const lateFeePerDay = reservation.car.tier ? (reservation.car.tier + 1) * 500 : 500;
    const totalLateFee = daysLate * lateFeePerDay;

    return { daysLate, lateFeePerDay, totalLateFee };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge classes
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="py-10 px-4 max-w-4xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55] inline-block"></div>
        <p className="mt-4">Loading reservation details...</p>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="py-10 px-4 max-w-4xl mx-auto">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <button 
            onClick={() => router.refresh()}
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // No reservation data
  if (!reservation) {
    return (
      <main className="py-10 px-4 max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-medium text-red-600 mb-4">Reservation Not Found</h2>
          <p className="text-gray-600 mb-6">The requested reservation could not be retrieved.</p>
          <Link 
            href="/account/reservations" 
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Back to Reservations
          </Link>
        </div>
      </main>
    );
  }

  // Calculate late fees
  const { daysLate, lateFeePerDay, totalLateFee } = calculateLateFees(reservation);

  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-medium">Reservation Details</h1>
        <Link 
          href="/account/reservations" 
          className="px-4 py-2 border border-[#8A7D55] text-[#8A7D55] rounded-md hover:bg-[#f8f5f0] transition-colors"
        >
          Back to Reservations
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vehicle Details */}
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="relative h-64">
              <Image 
                src="/img/banner.jpg" 
                alt={`${reservation.car.brand} ${reservation.car.model}`} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-serif font-medium text-[#8A7D55]">
                  {reservation.car.brand} {reservation.car.model}
                </h2>
                <p className="text-gray-600">
                  {reservation.car.type} | {reservation.car.color}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="font-medium">{reservation.car.license_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Daily Rate</p>
                  <p className="font-medium">{formatCurrency(reservation.car.dailyRate)}/day</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Tier</p>
                  <p className="font-medium">
                    {getTierName(reservation.car.tier)} (Tier {reservation.car.tier})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reservation Status</p>
                  <span 
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(reservation.status)}`}
                  >
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Details */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-3">Booking Information</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Reservation ID:</span>
                  <span className="font-medium">{reservation._id}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Pickup Date:</span>
                  <span className="font-medium">{formatDate(reservation.startDate)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Expected Return Date:</span>
                  <span className="font-medium">{formatDate(reservation.returnDate)}</span>
                </p>
                {reservation.actualReturnDate && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Actual Return Date:</span>
                    <span className="font-medium">{formatDate(reservation.actualReturnDate)}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-gray-600">Rental Period:</span>
                  <span className="font-medium">
                    {calculateRentalPeriod(reservation.startDate, reservation.returnDate)} days
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">Pricing Details</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span>{formatCurrency(reservation.car.dailyRate)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Rental Cost:</span>
                  <span>{formatCurrency(reservation.price)}</span>
                </p>
                
                {/* Late Fees Section */}
                {daysLate > 0 && (
                  <>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Days Late:</span>
                      <span className="text-red-600">{daysLate} days</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Late Fee per Day:</span>
                      <span>{formatCurrency(lateFeePerDay)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Total Late Fee:</span>
                      <span className="text-red-600">{formatCurrency(totalLateFee)}</span>
                    </p>
                  </>
                )}
                
                {reservation.additionalCharges && reservation.additionalCharges > 0 && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Additional Charges:</span>
                    <span className="text-red-600">{formatCurrency(reservation.additionalCharges)}</span>
                  </p>
                )}
                
                <p className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Paid:</span>
                  <span className="text-[#8A7D55]">
                    {formatCurrency(
                      reservation.price + 
                      (reservation.additionalCharges || 0) + 
                      (daysLate > 0 ? totalLateFee : 0)
                    )}
                  </span>
                </p>
              </div>
            </div>

            {reservation.notes && (
              <div>
                <h3 className="text-xl font-medium mb-3">Additional Notes</h3>
                <p className="text-gray-600 italic">{reservation.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
  {reservation.status === 'pending' && (
    <>
      <button 
        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        onClick={() => handleDeleteReservation(params.reservationId)} // Call the deletion function
      >
        Cancel Reservation
      </button>

      <button 
        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        // Add update reservation logic
      >
        Update Reservation
      </button>
    </>
  )}
</div>
    </main>
  );
}