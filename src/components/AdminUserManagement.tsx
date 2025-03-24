'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, createAuthHeader } from '@/config/apiConfig';
import { User, ApiResponse } from '@/types/dataTypes';
import { useSession } from 'next-auth/react';

interface AdminUserManagementProps {
  token: string;
}

interface AdminUserFormData {
  name: string;
  email: string;
  telephone_number: string;
  password: string;
  confirmPassword: string;
}

export default function AdminUserManagement({ token }: AdminUserManagementProps) {
  const { data: session } = useSession();
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<AdminUserFormData>({
    name: '',
    email: '',
    telephone_number: '',
    password: '',
    confirmPassword: '',
  });

  // Fetch all admin users on component mount
  // Log token on component mount to verify it's being received
  useEffect(() => {
    console.log('AdminUserManagement mounted with token available:', !!token);
    if (!token) {
      setError('No authentication token available. Please log in again.');
    } else {
      fetchAdminUsers();
    }
  }, [token]);

  const fetchAdminUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Log the token to check if it's available
      console.log('Auth token available:', !!token);
      console.log('Authorization header:', `Bearer ${token.substring(0, 10)}...`);
      
      // Use the auth/admins endpoint as specified in the router definition
      const response = await fetch(`${API_BASE_URL}/auth/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Admin fetch failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch admin users: ${response.status}`);
      }

      const data = await response.json();
      console.log('Admin data received:', data);
      
      // Handle the exact format provided by the getAdmins controller
      if (data.success && Array.isArray(data.data)) {
        setAdminUsers(data.data);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      setError('Could not load admin users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form fields function
  const resetFormFields = () => {
    setFormData({
      name: '',
      email: '',
      telephone_number: '',
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
    if (!formData.name || !formData.email || !formData.telephone_number || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate phone format according to the example (XXX-XXXXXXX)
    const phoneRegex = /^\d{3}-\d{7}$/;
    if (!phoneRegex.test(formData.telephone_number)) {
      setError('Phone number must be in format XXX-XXXXXXX (e.g., 123-4567890)');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          telephone_number: formData.telephone_number,
          role: "admin"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Failed to create admin user');
      }

      // Reset form and show success message
      resetFormFields();
      setSuccess('Admin user created successfully');
      setShowCreateForm(false);
      
      // Refresh the admin users list
      fetchAdminUsers();
    } catch (error) {
      console.error('Error creating admin user:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    // Prevent deleting themselves
    if (userId === session?.user?._id) {
      setError('You cannot delete your own admin account');
      return;
    }

    if (!confirm('Are you sure you want to deactivate this admin user?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admins/${userId}`, {
        method: 'DELETE',
        headers: {
          ...createAuthHeader(token),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.msg || 'Failed to deactivate user');
      }

      setSuccess('Admin user deactivated successfully');
      
      // Update the admin users list
      setAdminUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deactivating user:', error);
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

      {/* Create Admin Button */}
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
          {showCreateForm ? 'Cancel' : 'Create New Admin'}
        </button>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="mb-8 p-5 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Create New Administrator</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>
              
              <div>
                <label htmlFor="telephone_number" className="block text-gray-700 mb-1">
                  Telephone (XXX-XXXXXXX)
                </label>
                <input
                  type="tel"
                  id="telephone_number"
                  name="telephone_number"
                  value={formData.telephone_number}
                  onChange={handleInputChange}
                  placeholder="123-4567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
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
                {isLoading ? 'Creating...' : 'Create Admin User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="overflow-x-auto">
        <h2 className="text-xl font-medium mb-4">Current Administrators</h2>
        
        {isLoading && !adminUsers.length ? (
          <p className="text-center py-4">Loading admin users...</p>
        ) : adminUsers.length === 0 ? (
          <p className="text-center py-4 text-gray-600">No admin users found.</p>
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
                  Telephone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.telephone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.tier === 0 ? 'Standard' : `Tier ${user.tier}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user._id === session?.user?._id ? (
                      <span className="text-gray-400 cursor-not-allowed">
                        Current User
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeactivateUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
                      </button>
                    )}
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