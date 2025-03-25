'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, createAuthHeader } from '@/config/apiConfig';

interface CarProviderProps {
  token: string;
}

interface CarProviderData {
  _id: string;
  name: string;
  address: string;
  telephone_number: string;
  email: string;
  createdAt?: string;
}

interface CarProviderFormData {
  name: string;
  address: string;
  telephone_number: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function CarProvider({ token }: CarProviderProps) {
  const [carProviders, setCarProviders] = useState<CarProviderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CarProviderFormData>({
    name: '',
    address: '',
    telephone_number: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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
      console.log('Fetching car providers with token:', token ? 'Token exists' : 'No token');
      
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
      
      // Handle different data formats
      if (data.success && Array.isArray(data.data)) {
        setCarProviders(data.data);
      } else if (Array.isArray(data)) {
        setCarProviders(data);
      } else {
        console.error('Unexpected data format:', data);
        setCarProviders([]);
        setError('Received invalid data format from server');
      }
    } catch (error) {
      console.error('Error fetching car providers:', error);
      setError('Could not load car providers. Please try again later.');
      setCarProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form fields
  const resetFormFields = () => {
    setFormData({
      name: '',
      address: '',
      telephone_number: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  // Handle cancel button click
  const handleCancelCreate = () => {
    resetFormFields();
    setShowCreateForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.address || !formData.telephone_number || !formData.email || !formData.password) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Validate phone format (XXX-XXXXXXX)
    const phoneRegex = /^\d{3}-\d{7}$/;
    if (!phoneRegex.test(formData.telephone_number)) {
      setError('Phone number must be in format XXX-XXXXXXX (e.g., 123-4567890)');
      return false;
    }

    // Validate email format
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Car_Provider`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          telephone_number: formData.telephone_number,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Failed to create car provider');
      }

      // Reset form and show success message
      resetFormFields();
      setSuccess('Car provider created successfully');
      setShowCreateForm(false);
      
      // Refresh the car providers list
      fetchCarProviders();
    } catch (error) {
      console.error('Error creating car provider:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateProvider = async (providerId: string) => {
    if (!confirm('WARNING: Deactivating this car provider will permanently delete ALL cars associated with this provider. Are you sure you want to continue?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/Car_Provider/${providerId}`, {
        method: 'DELETE',
        headers: {
          ...createAuthHeader(token),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.msg || 'Failed to deactivate car provider');
      }

      // Check if the response contains information about deleted cars
      let successMessage = 'Car provider deactivated successfully';
      
      try {
        const data = await response.json();
        if (data.message && data.message.includes('associated cars')) {
          successMessage = data.message;
        }
      } catch (e) {
        // If we can't parse the response, just use the default message
      }
      
      setSuccess(successMessage);
      
      // Update the car providers list
      setCarProviders(prevProviders => prevProviders.filter(provider => provider._id !== providerId));
    } catch (error) {
      console.error('Error deactivating car provider:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Success and Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          {error.includes('401') && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Your session might have expired. Try signing out and back in.</li>
                <li>Make sure you have admin privileges.</li>
                <li>Check if your backend API is running correctly.</li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Create Provider Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            if (showCreateForm) {
              handleCancelCreate();
            } else {
              setShowCreateForm(true);
            }
          }}
          className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Create New Provider'}
        </button>
      </div>

      {/* Create Provider Form */}
      {showCreateForm && (
        <div className="mb-8 p-5 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Create New Car Provider</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  Provider Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="telephone_number" className="block text-gray-700 mb-1">
                  Telephone * (XXX-XXXXXXX)
                </label>
                <input
                  type="tel"
                  id="telephone_number"
                  name="telephone_number"
                  value={formData.telephone_number}
                  onChange={handleInputChange}
                  placeholder="123-4567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Provider'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Providers Table */}
      <div className="overflow-x-auto">
        <h2 className="text-xl font-medium mb-4">Car Providers</h2>
        
        {isLoading && !carProviders.length ? (
          <p className="text-center py-4">Loading car providers...</p>
        ) : carProviders.length === 0 ? (
          <p className="text-center py-4 text-gray-600">No car providers found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telephone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carProviders.map((provider) => (
                <tr key={provider._id}>
                  <td className="px-6 py-4 whitespace-normal break-words">
                    <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words">
                    <div className="text-sm text-gray-500">{provider.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words max-w-xs">
                    <div className="text-sm text-gray-500">{provider.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{provider.telephone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeactivateProvider(provider._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}