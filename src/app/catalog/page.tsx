// src/app/catalog/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CatalogPage() {
  // Authentication
  const { data: session } = useSession();
  
  // Car data state
  const [cars, setCars] = useState([]);
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Price range state
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 500
  });
  
  // Sort state
  const [sortOption, setSortOption] = useState('default');
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    vehicleType: '',
    brand: '',
    year: '',
    seats: '',
    provider: ''
  });
  
  // Fetch car data and providers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!session?.user?.token) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }
        
        const authHeader = {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json'
        };
        
        // Fetch providers first
        const providersResponse = await fetch('http://localhost:5000/api/v1/Car_Provider', {
          headers: authHeader
        });
        
        if (!providersResponse.ok) {
          throw new Error(`Error fetching providers: ${providersResponse.status}`);
        }
        
        const providersData = await providersResponse.json();
        
        // Create a map of provider IDs to provider objects for easy lookup
        const providersMap = {};
        if (providersData.success && Array.isArray(providersData.data)) {
          providersData.data.forEach(provider => {
            providersMap[provider._id] = provider;
          });
          setProviders(providersMap);
        }
        
        // Then fetch cars
        const carsResponse = await fetch('http://localhost:5000/api/v1/cars', {
          headers: authHeader
        });
        
        if (!carsResponse.ok) {
          throw new Error(`Error fetching cars: ${carsResponse.status}`);
        }
        
        const carsData = await carsResponse.json();
        
        // Map the API response to match our expected car format
        if (carsData.success && Array.isArray(carsData.data)) {
          const formattedCars = carsData.data.map(car => {
            // Get provider details from our providers map
            const provider = providersMap[car.provider_id] || { name: 'Unknown Provider' };
            
            return {
              id: car._id || car.id,
              brand: car.brand || 'Unknown Brand',
              model: car.model || 'Unknown Model',
              year: car.manufactureDate ? new Date(car.manufactureDate).getFullYear() : 2023,
              price: car.dailyRate || 0,
              type: car.type || 'Other',
              seats: car.seats || 5,
              providerId: car.provider_id,
              provider: provider.name || 'Unknown Provider',
              image: car.image || '/img/car-default.jpg'
            };
          });
          setCars(formattedCars);
        } else {
          setCars([]);
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if we have a session
    if (session?.user?.token) {
      fetchData();
    } else {
      setLoading(false);
      setError('Please log in to view available cars');
    }
  }, [session]);
  
  // Extract unique values for filter options from fetched data
  const extractFilterOptions = () => {
    if (!cars.length) return {
      vehicleType: [],
      brand: [],
      year: [],
      seats: [],
      provider: []
    };
    
    return {
      vehicleType: [...new Set(cars.map(car => car.type))].filter(Boolean),
      brand: [...new Set(cars.map(car => car.brand))].filter(Boolean),
      year: [...new Set(cars.map(car => car.year.toString()))].filter(Boolean),
      seats: [...new Set(cars.map(car => car.seats.toString()))].filter(Boolean),
      provider: [...new Set(cars.map(car => car.provider))].filter(Boolean)
    };
  };
  
  const filterOptions = extractFilterOptions();
  
  // Toggle filter selection
  const toggleFilter = (category, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value
    }));
  };
  
  // Filter the cars
  const filteredCars = cars.filter(car => {
    // Apply search query filter
    const searchLower = searchQuery.toLowerCase();
    const modelMatch = `${car.brand} ${car.model}`.toLowerCase().includes(searchLower);
    const providerMatch = car.provider.toLowerCase().includes(searchLower);
    
    if (searchQuery && !modelMatch && !providerMatch) return false;
    
    // Apply price range filter
    if (car.price < priceRange.min || car.price > priceRange.max) return false;
    
    // Apply all other filters
    if (activeFilters.vehicleType && car.type !== activeFilters.vehicleType) return false;
    if (activeFilters.brand && car.brand !== activeFilters.brand) return false;
    if (activeFilters.year && car.year.toString() !== activeFilters.year) return false;
    if (activeFilters.seats && car.seats.toString() !== activeFilters.seats) return false;
    if (activeFilters.provider && car.provider !== activeFilters.provider) return false;
    return true;
  });
  
  // Sort function
  const sortCars = (carsToSort) => {
    switch(sortOption) {
      case 'price_asc':
        return [...carsToSort].sort((a, b) => a.price - b.price);
      case 'price_desc':
        return [...carsToSort].sort((a, b) => b.price - a.price);
      case 'provider':
        return [...carsToSort].sort((a, b) => a.provider.localeCompare(b.provider));
      case 'brand':
        return [...carsToSort].sort((a, b) => a.brand.localeCompare(b.brand));
      default:
        return carsToSort;
    }
  };
  
  // Then sort the filtered cars
  const sortedCars = sortCars(filteredCars);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {loading ? 'Loading cars...' : 
             error ? 'Error loading cars' : 
             `${filteredCars.length} cars available`}
          </h1>
          
          {/* Sort dropdown */}
          <div className="relative">
            <div 
              className="flex items-center bg-white border rounded-md px-3 py-2 cursor-pointer" 
              onClick={() => document.getElementById('sortDropdown')?.classList.toggle('hidden')}
            >
              <span className="mr-2">
                Sort by: {
                  sortOption === 'default' ? 'Recommended' : 
                  sortOption === 'price_asc' ? 'Price: Low to High' : 
                  sortOption === 'price_desc' ? 'Price: High to Low' : 
                  sortOption === 'provider' ? 'Provider' :
                  sortOption === 'brand' ? 'Brand' : 'Recommended'
                }
              </span>
              <ChevronDown size={16} />
            </div>
            <div id="sortDropdown" className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10 w-48 hidden">
              <div 
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${sortOption === 'default' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => {
                  setSortOption('default');
                  document.getElementById('sortDropdown')?.classList.add('hidden');
                }}
              >
                Recommended
              </div>
              <div 
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${sortOption === 'price_asc' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => {
                  setSortOption('price_asc');
                  document.getElementById('sortDropdown')?.classList.add('hidden');
                }}
              >
                Price: Low to High
              </div>
              <div 
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${sortOption === 'price_desc' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => {
                  setSortOption('price_desc');
                  document.getElementById('sortDropdown')?.classList.add('hidden');
                }}
              >
                Price: High to Low
              </div>
              <div 
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${sortOption === 'provider' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => {
                  setSortOption('provider');
                  document.getElementById('sortDropdown')?.classList.add('hidden');
                }}
              >
                Provider
              </div>
              <div 
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${sortOption === 'brand' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => {
                  setSortOption('brand');
                  document.getElementById('sortDropdown')?.classList.add('hidden');
                }}
              >
                Brand
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters and search */}
        <div className="mb-6">
          {/* Search bar */}
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by car model or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55] sm:text-sm"
            />
          </div>
          
          {/* Price range selector */}
          <div className="mb-4 flex items-center">
            <div className="mr-2 text-sm font-medium text-gray-700">Price Range:</div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">From</span>
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</span>
                    <input
                      type="number"
                      min="0"
                      max={priceRange.max}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55] sm:text-sm"
                    />
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="relative">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">Until</span>
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</span>
                    <input
                      type="number"
                      min={priceRange.min}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 0})}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55] sm:text-sm"
                    />
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        
          <div className="flex flex-wrap gap-2">
            <div className="relative group">
              <div className={`flex items-center px-3 py-2 border rounded-full cursor-pointer ${activeFilters.vehicleType ? 'bg-[#8A7D55] text-white' : 'bg-white'}`}>
                <span>Vehicle type {activeFilters.vehicleType && `· ${activeFilters.vehicleType}`}</span>
              </div>
              
              <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10 min-w-[150px] hidden group-hover:block">
                {filterOptions.vehicleType.map(type => (
                  <div 
                    key={type} 
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${activeFilters.vehicleType === type ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={() => toggleFilter('vehicleType', type)}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className={`flex items-center px-3 py-2 border rounded-full cursor-pointer ${activeFilters.brand ? 'bg-[#8A7D55] text-white' : 'bg-white'}`}>
                <span>Make {activeFilters.brand && `· ${activeFilters.brand}`}</span>
              </div>
              
              <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10 min-w-[150px] hidden group-hover:block">
                {filterOptions.brand.map(brand => (
                  <div 
                    key={brand} 
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${activeFilters.brand === brand ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={() => toggleFilter('brand', brand)}
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className={`flex items-center px-3 py-2 border rounded-full cursor-pointer ${activeFilters.year ? 'bg-[#8A7D55] text-white' : 'bg-white'}`}>
                <span>Year {activeFilters.year && `· ${activeFilters.year}`}</span>
              </div>
              
              <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10 min-w-[150px] hidden group-hover:block">
                {filterOptions.year.map(year => (
                  <div 
                    key={year} 
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${activeFilters.year === year ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={() => toggleFilter('year', year)}
                  >
                    {year}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className={`flex items-center px-3 py-2 border rounded-full cursor-pointer ${activeFilters.seats ? 'bg-[#8A7D55] text-white' : 'bg-white'}`}>
                <span>Seats {activeFilters.seats && `· ${activeFilters.seats}`}</span>
              </div>
              
              <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10 min-w-[150px] hidden group-hover:block">
                {filterOptions.seats.map(seat => (
                  <div 
                    key={seat} 
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${activeFilters.seats === seat ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={() => toggleFilter('seats', seat)}
                  >
                    {seat} seats
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className={`flex items-center px-3 py-2 border rounded-full cursor-pointer ${activeFilters.provider ? 'bg-[#8A7D55] text-white' : 'bg-white'}`}>
                <span>Provider {activeFilters.provider && `· ${activeFilters.provider}`}</span>
              </div>
              
              <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10 min-w-[150px] hidden group-hover:block">
                {filterOptions.provider.map(provider => (
                  <div 
                    key={provider} 
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${activeFilters.provider === provider ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={() => toggleFilter('provider', provider)}
                  >
                    {provider}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Clear filters button */}
            {Object.values(activeFilters).some(filter => filter !== '') && (
              <div 
                className="flex items-center px-3 py-2 border border-red-300 text-red-600 rounded-full cursor-pointer hover:bg-red-50"
                onClick={() => setActiveFilters({vehicleType: '', brand: '', year: '', seats: '', provider: ''})}
              >
                <span>Clear filters</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Authentication error */}
      {!session && (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-red-600">Authentication Required</h3>
          <p className="text-gray-600 mt-2">Please sign in to view available cars.</p>
          <a 
            href="/signin?callbackUrl=/catalog" 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] inline-block"
          >
            Sign In
          </a>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && session && (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-red-600">Error loading cars</h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48]"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Cars grid - only show when we have data and no errors */}
      {!loading && !error && session && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedCars.map((car) => (
          <div key={car.id} className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="relative">
              <img 
                src={car.image} 
                alt={`${car.brand} ${car.model}`} 
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-bold">{car.brand} {car.model} {car.year}</h2>
                  <p className="text-sm text-gray-600 -mt-1">
                    Provided by <span className="font-medium text-blue-700">{car.provider}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg text-[#8A7D55]">${car.price}</span>
                  <span className="text-gray-600 text-sm"> /day</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                  {car.type}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                  {car.seats} seats
                </span>
              </div>
              
              <div className="mt-4">
              <a href="/reserve">
                <button className="w-full py-2.5 bg-[#8A7D55] hover:bg-[#766b48] text-white rounded-md text-sm font-medium transition-colors duration-200 shadow-sm">
                  Book Now
                </button>
                </a>
              </div>
            </div>
          </div>
        ))}
              </div>
      )}
      
      {/* No results message */}
      {!loading && !error && filteredCars.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-gray-600">No cars match your current filters</h3>
          <button 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48]"
            onClick={() => setActiveFilters({vehicleType: '', brand: '', year: '', seats: '', provider: ''})}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}