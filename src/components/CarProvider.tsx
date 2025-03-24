'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';

interface CarProviderProps {
  token: string;
}

interface CarProviderData {
  name: string;
  address: string;
  telephone_number: string;
}

export default function CarProvider({ token }: CarProviderProps) {
  const [carProviders, setCarProviders] = useState<CarProviderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchCarProviders();
    } else {
      setError('Authentication token is missing');
      setIsLoading(false);
    }
  }, [token]);

  const fetchCarProviders = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/Car_Provider`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch car providers: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Ensure we're setting an array
      if (Array.isArray(data)) {
        setCarProviders(data);
      } else if (data.data && Array.isArray(data.data)) {
        // Some APIs wrap data in a data property
        setCarProviders(data.data);
      } else {
        // If it's neither format, set an empty array and log the error
        console.error('Unexpected data format:', data);
        setCarProviders([]);
        setError('Received invalid data format from server');
      }
    } catch (error) {
      console.error('Error fetching car providers:', error);
      setError('Could not load car providers. Please try again later.');
      setCarProviders([]); // Ensure carProviders is an array even on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <h2 className="text-xl font-medium mb-4">Car Providers</h2>
      
      {isLoading ? (
        <p className="text-center py-4">Loading car providers...</p>
      ) : carProviders.length === 0 ? (
        <p className="text-center py-4 text-gray-600">No car providers found.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telephone</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carProviders.map((provider, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{provider.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.address}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.telephone_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}