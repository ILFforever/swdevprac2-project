"use client"

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';
import { useSession } from 'next-auth/react';
import { ChevronDown, ChevronLeft, ChevronRight, Search, CalendarIcon } from 'lucide-react';
import Link from 'next/link';

// Type definitions
interface Car {
  _id: string;
  brand: string;
  model: string;
  license_plate: string;
  type: string;
  color: string;
  dailyRate: number;
  tier: number;
  provider_id: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  telephone_number: string;
  role: string;
}

interface Reservation {
  _id: string;
  startDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  price: number;
  additionalCharges?: number;
  notes?: string;
  car: string | Car;
  user: string | User;
  createdAt: string;
}

interface ReservationManagementProps {
  token: string;
}

export default function ReservationManagement({ token }: ReservationManagementProps) {
  const { data: session } = useSession();
  
  // State variables
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string}>({
    start: '', 
    end: ''
  });
  
  // Details view
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Fetch cars and users for better display
  const [cars, setCars] = useState<{[key: string]: Car}>({});
  const [users, setUsers] = useState<{[key: string]: User}>({});
  
  // Action states
  const [processingAction, setProcessingAction] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    show: boolean;
    action: 'confirm' | 'complete' | 'cancel' | null;
    reservationId: string;
  }>({
    show: false,
    action: null,
    reservationId: ''
  });

  // Notes for reservation actions
  const [actionNotes, setActionNotes] = useState('');

  // Fetch all reservations
  useEffect(() => {
    const fetchReservations = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch all reservations
        const response = await fetch(`${API_BASE_URL}/rents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reservations: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Store all reservations
          setReservations(data.data);
          
          // Also set filtered reservations initially to all reservations
          setFilteredReservations(data.data);
          
          // Calculate total pages based on items per page
          setTotalPages(Math.ceil(data.data.length / itemsPerPage));
          
          // Collect all car and user IDs for further fetching
          const carIds = new Set<string>();
          const userIds = new Set<string>();
          
          data.data.forEach((reservation: Reservation) => {
            if (typeof reservation.car === 'string') {
              carIds.add(reservation.car);
            } else if (reservation.car && typeof reservation.car === 'object') {
              carIds.add(reservation.car._id);
            }
            
            if (typeof reservation.user === 'string') {
              userIds.add(reservation.user);
            } else if (reservation.user && typeof reservation.user === 'object') {
              userIds.add(reservation.user._id);
            }
          });
          
          // Fetch car details
          await fetchCarDetails(Array.from(carIds));
          
          // Fetch user details
          await fetchUserDetails(Array.from(userIds));
        } else {
          setFilteredReservations([]);
          throw new Error('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReservations();
  }, [token, itemsPerPage]);

  // Fetch car details by IDs
  const fetchCarDetails = async (carIds: string[]) => {
    try {
      // Create a map to store car details
      const carDetailsMap: {[key: string]: Car} = {};
      
      // Fetch details for each car
      for (const carId of carIds) {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            carDetailsMap[carId] = data.data;
          }
        }
      }
      
      setCars(carDetailsMap);
    } catch (err) {
      console.error('Error fetching car details:', err);
    }
  };

  // Fetch user details by IDs
  const fetchUserDetails = async (userIds: string[]) => {
    try {
      // Create a map to store user details
      const userDetailsMap: {[key: string]: User} = {};
      
      // This is a placeholder - in a real system you'd have an API endpoint to get user details by ID
      // For now, we'll just use the existing users endpoint as an example
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Map users by ID for easy lookup
          data.data.forEach((user: User) => {
            userDetailsMap[user._id] = user;
          });
        }
      }
      
      setUsers(userDetailsMap);
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let results = [...reservations];
    
    // Apply status filter
    if (statusFilter) {
      results = results.filter(reservation => reservation.status === statusFilter);
    }
    
    // Apply date range filter
    if (dateRangeFilter.start) {
      const startDate = new Date(dateRangeFilter.start);
      results = results.filter(reservation => new Date(reservation.startDate) >= startDate);
    }
    
    if (dateRangeFilter.end) {
      const endDate = new Date(dateRangeFilter.end);
      results = results.filter(reservation => new Date(reservation.returnDate) <= endDate);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      results = results.filter(reservation => {
        // Search in reservation ID
        if (reservation._id.toLowerCase().includes(query)) return true;
        
        // Search in car details
        const car = typeof reservation.car === 'string' 
          ? cars[reservation.car]
          : reservation.car as Car;
          
        if (car) {
          if (car.brand?.toLowerCase().includes(query)) return true;
          if (car.model?.toLowerCase().includes(query)) return true;
          if (car.license_plate?.toLowerCase().includes(query)) return true;
        }
        
        // Search in user details
        const user = typeof reservation.user === 'string'
          ? users[reservation.user]
          : reservation.user as User;
          
        if (user) {
          if (user.name?.toLowerCase().includes(query)) return true;
          if (user.email?.toLowerCase().includes(query)) return true;
          if (user.telephone_number?.toLowerCase().includes(query)) return true;
        }
        
        return false;
      });
    }
    
    setFilteredReservations(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, dateRangeFilter, reservations, cars, users, itemsPerPage]);

  // Handle reservation confirmation (change from pending to active)
  const confirmReservation = async (reservationId: string) => {
    setProcessingAction(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/rents/${reservationId}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: actionNotes })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to confirm reservation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Reservation confirmed successfully');
        
        // Update the reservation in the state
        setReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'active' } : res
        ));
        
        // Also update in filtered reservations
        setFilteredReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'active' } : res
        ));
        
        // Close any open modals
        setConfirmationModal({ show: false, action: null, reservationId: '' });
        setActionNotes('');
      } else {
        throw new Error(data.message || 'Failed to confirm reservation');
      }
    } catch (err) {
      console.error('Error confirming reservation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while confirming the reservation');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle reservation completion
  const completeReservation = async (reservationId: string) => {
    setProcessingAction(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/rents/${reservationId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: actionNotes })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to complete reservation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Reservation completed successfully');
        
        // Update the reservation in the state
        setReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'completed', actualReturnDate: new Date().toISOString() } : res
        ));
        
        // Also update in filtered reservations
        setFilteredReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'completed', actualReturnDate: new Date().toISOString() } : res
        ));
        
        // Close any open modals
        setConfirmationModal({ show: false, action: null, reservationId: '' });
        setActionNotes('');
      } else {
        throw new Error(data.message || 'Failed to complete reservation');
      }
    } catch (err) {
      console.error('Error completing reservation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while completing the reservation');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle reservation cancellation
  const cancelReservation = async (reservationId: string) => {
    setProcessingAction(true);
    
    try {
      // For cancellation, we'll use the update endpoint since there might not be a dedicated cancel endpoint
      const response = await fetch(`${API_BASE_URL}/rents/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          notes: actionNotes 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel reservation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Reservation cancelled successfully');
        
        // Update the reservation in the state
        setReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'cancelled' } : res
        ));
        
        // Also update in filtered reservations
        setFilteredReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'cancelled' } : res
        ));
        
        // Close any open modals
        setConfirmationModal({ show: false, action: null, reservationId: '' });
        setActionNotes('');
      } else {
        throw new Error(data.message || 'Failed to cancel reservation');
      }
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while cancelling the reservation');
    } finally {
      setProcessingAction(false);
    }
  };

  // Get car details by ID or object
  const getCarDetails = (car: string | Car): Car | undefined => {
    if (typeof car === 'string') {
      return cars[car];
    }
    return car as Car;
  };

  // Get user details by ID or object
  const getUserDetails = (user: string | User): User | undefined => {
    if (typeof user === 'string') {
      return users[user];
    }
    return user as User;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  // Calculate paginated data
  const paginatedData = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle view details button click
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setSelectedReservation(null);
    setShowDetailsModal(false);
  };

  // Handle reservation action
  const handleReservationAction = (action: 'confirm' | 'complete' | 'cancel', reservation: Reservation) => {
    setConfirmationModal({
      show: true,
      action,
      reservationId: reservation._id
    });
    setActionNotes('');
  };

  // Execute the selected action
  const executeAction = () => {
    if (!confirmationModal.action || !confirmationModal.reservationId) return;
    
    switch (confirmationModal.action) {
      case 'confirm':
        confirmReservation(confirmationModal.reservationId);
        break;
      case 'complete':
        completeReservation(confirmationModal.reservationId);
        break;
      case 'cancel':
        cancelReservation(confirmationModal.reservationId);
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
    {/* Success and Error Messages */}
      {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
        {error}
      </div>
    )}
     {success && (
    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
      {success}
    </div>
  )}

  {/* Filters and Search */}
  <div className="flex flex-wrap gap-4 mb-6">
    {/* Search Bar */}
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search reservations by ID, car, or customer..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
      />
    </div>
    
    {/* Status Filter */}
    <div className="relative">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] appearance-none"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
    
    {/* Date Range Filters */}
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="date"
          placeholder="From Date"
          value={dateRangeFilter.start}
          onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
          className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
        />
      </div>
      <span className="text-gray-500">to</span>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="date"
          placeholder="To Date"
          value={dateRangeFilter.end}
          min={dateRangeFilter.start}
          onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
          className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
        />
      </div>
    </div>
    
    {/* Clear Filters */}
      <button
        onClick={() => {
          setSearchQuery('');
          setStatusFilter('');
          setDateRangeFilter({ start: '', end: '' });
        }}
        className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
      >
        Clear Filters
      </button>
  </div>

  {/* Reservations Table */}
  {isLoading ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
    </div>
  ) : filteredReservations.length === 0 ? (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <p className="text-gray-500 text-lg">No reservations match your criteria</p>
      <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
    </div>
  ) : (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Reservation ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((reservation) => {
              const car = getCarDetails(reservation.car);
              const user = getUserDetails(reservation.user);
              
              return (
                <tr key={reservation._id} className="hover:bg-gray-50">
                   {/* Reservation ID */}
                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900 font-medium">
                          {formatDate(reservation.createdAt).split(',')}
                        </div>
                    </td>
                  
                  {/* Customer */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.telephone_number}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Unknown customer</div>
                    )}
                  </td>
                  
                  {/* Vehicle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {car ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{car.brand} {car.model}</div>
                        <div className="text-sm text-gray-500">{car.license_plate}</div>
                        <div className="text-xs text-gray-500 capitalize">{car.type} • {car.color}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Unknown vehicle</div>
                    )}
                  </td>
                  
                  {/* Dates */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-gray-500 w-12">From:</span>
                        <span>{formatDate(reservation.startDate).split(',')[0]}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-gray-500 w-12">Until:</span>
                        <span>{formatDate(reservation.returnDate).split(',')[0]}</span>
                      </div>
                      {reservation.actualReturnDate && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="text-xs font-medium text-gray-500 w-12">Actual:</span>
                          <span>{formatDate(reservation.actualReturnDate).split(',')[0]}</span>
                        </div>
                      )}
                    </div>
                  </td>
                                    
                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(reservation.price)}
                    </div>
                    {reservation.additionalCharges != null && reservation.additionalCharges > 0 ? (
                      <div className="text-xs text-red-500">
                        {formatCurrency(reservation.additionalCharges)} (extra)
                      </div>
                    ) : null}
                  </td>

                  
                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(reservation.status)}`}
                    >
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => handleViewDetails(reservation)}
                        className="text-[#8A7D55] hover:text-[#766b48] mr-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {reservation.status === 'pending' && (
                        <button 
                          onClick={() => handleReservationAction('confirm', reservation)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none mr-2"
                        >
                          Confirm
                        </button>
                      )}
                      
                      {reservation.status === 'active' && (
                        <button
                          onClick={() => handleReservationAction('complete', reservation)} 
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none mr-2"
                        >
                          Complete
                        </button>
                      )}
                      
                      {(reservation.status === 'pending' || reservation.status === 'active') && (
                        <button
                          onClick={() => handleReservationAction('cancel', reservation)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none"  
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>
)}