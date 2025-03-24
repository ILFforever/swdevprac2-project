'use client'
import React, { useState, useEffect } from 'react';

const CarCatalog = () => {
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    vehicleType: '',
    brand: '',
    year: '',
    seats: '',
    price: ''
  });
  
  // Filter options
  const filterOptions = {
    vehicleType: ['SUV', 'Sedan', 'Sports Car', 'Compact SUV'],
    brand: ['BMW', 'Tesla', 'Ford', 'Chevrolet', 'Mercedes-Benz'],
    year: ['2018', '2022', '2023', '2024', '2025'],
    seats: ['4', '5', '7'],
    price: ['< $150', '$150-$200', '$200-$250', '> $250']
  };
  
  // Toggle filter selection
  const toggleFilter = (category, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value
    }));
  };
  
  // Price filter helper function
  const matchesPriceFilter = (carPrice, priceFilter) => {
    if (!priceFilter) return true;
    
    switch(priceFilter) {
      case '< $150': return carPrice < 150;
      case '$150-$200': return carPrice >= 150 && carPrice < 200;
      case '$200-$250': return carPrice >= 200 && carPrice < 250;
      case '> $250': return carPrice >= 250;
      default: return true;
    }
  };
  
  const cars = [
    {
      id: 1,
      brand: 'BMW',
      model: 'iX',
      year: 2024,
      price: 283,
      type: 'SUV',
      seats: 5,
      image: '/img/car-bmw.jpg'
    },
    {
      id: 2,
      brand: 'Tesla',
      model: 'Model 3',
      year: 2025,
      price: 155,
      type: 'Sedan',
      seats: 5,
      image: '/img/car-tesla.jpg'
    },
    {
      id: 3,
      brand: 'Ford',
      model: 'Mustang',
      year: 2018,
      price: 176,
      type: 'Sports Car',
      seats: 4,
      image: '/img/car-mustang.jpg'
    },
    {
      id: 4,
      brand: 'Ford',
      model: 'Mustang',
      year: 2022,
      price: 202,
      type: 'Sports Car',
      seats: 4,
      image: '/img/car-mustang-red.jpg'
    },
    {
      id: 5,
      brand: 'Chevrolet',
      model: 'Trax',
      year: 2024,
      price: 118,
      type: 'Compact SUV',
      seats: 5,
      image: '/img/car-trax.jpg'
    },
    {
      id: 6,
      brand: 'Mercedes-Benz',
      model: 'GLE',
      year: 2023,
      price: 225,
      type: 'SUV',
      seats: 7,
      image: '/img/car-mercedes.jpg'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-4">200+ cars available</h1>
        
        {/* Functional filter bar */}
        <div className="flex flex-wrap gap-2 mb-6">
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
            <div className={`flex items-center px-3 py-2 border rounded-full cursor-pointer ${activeFilters.price ? 'bg-[#8A7D55] text-white' : 'bg-white'}`}>
              <span>Price {activeFilters.price && `· ${activeFilters.price}`}</span>
            </div>
            
            <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10 min-w-[150px] hidden group-hover:block">
              {filterOptions.price.map(price => (
                <div 
                  key={price} 
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${activeFilters.price === price ? 'bg-gray-100 font-medium' : ''}`}
                  onClick={() => toggleFilter('price', price)}
                >
                  {price}
                </div>
              ))}
            </div>
          </div>
          
          {/* Clear filters button */}
          {Object.values(activeFilters).some(filter => filter !== '') && (
            <div 
              className="flex items-center px-3 py-2 border border-red-300 text-red-600 rounded-full cursor-pointer hover:bg-red-50"
              onClick={() => setActiveFilters({vehicleType: '', brand: '', year: '', seats: '', price: ''})}
            >
              <span>Clear filters</span>
            </div>
          )}
        </div>
      </header>

      {/* Filtered cars grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cars.filter(car => {
          // Apply all filters
          if (activeFilters.vehicleType && car.type !== activeFilters.vehicleType) return false;
          if (activeFilters.brand && car.brand !== activeFilters.brand) return false;
          if (activeFilters.year && car.year.toString() !== activeFilters.year) return false;
          if (activeFilters.seats && car.seats.toString() !== activeFilters.seats) return false;
          if (activeFilters.price && !matchesPriceFilter(car.price, activeFilters.price)) return false;
          return true;
        }).map((car) => (
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
                <h2 className="text-lg font-bold">{car.brand} {car.model} {car.year}</h2>
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
                <button className="w-full py-2.5 bg-[#8A7D55] hover:bg-[#766b48] text-white rounded-md text-sm font-medium transition-colors duration-200 shadow-sm">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* No results message */}
      {cars.filter(car => {
        if (activeFilters.vehicleType && car.type !== activeFilters.vehicleType) return false;
        if (activeFilters.brand && car.brand !== activeFilters.brand) return false;
        if (activeFilters.year && car.year.toString() !== activeFilters.year) return false;
        if (activeFilters.seats && car.seats.toString() !== activeFilters.seats) return false;
        if (activeFilters.price && !matchesPriceFilter(car.price, activeFilters.price)) return false;
        return true;
      }).length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-gray-600">No cars match your current filters</h3>
          <button 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48]"
            onClick={() => setActiveFilters({vehicleType: '', brand: '', year: '', seats: '', price: ''})}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CarCatalog;