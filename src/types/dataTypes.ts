// User data type
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  telephone_number?: string;
  total_spend: number;
  tier: number;
  createdAt: string;
}

// Venue/vehicle data type
export interface Venue {
  _id: string;
  name: string;
  description: string;
  picture: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel: string;
  dailyrate: number;
}

// Reservation/booking data type
export interface Reservation {
  _id: string;
  id?: string; // Some APIs might return either id or _id
  user: string | User;
  venue: string | Venue;
  vehicleName?: string; // For display purposes
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

// API response format
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}