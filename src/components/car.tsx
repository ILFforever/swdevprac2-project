'use client';

import Image from 'next/image';
import React from 'react';
import InteractiveCar from './InteractiveCar';

export default function CarCard({ carId, brand, imgSrc }:{carId:string, brand:string, imgSrc:string }){

    return (
        <InteractiveCar>
            <div className='w-full h-[70%] relative rounded-t-lg'>
                <Image 
                    src={imgSrc} 
                    alt={`${brand} Image`} 
                    fill={true} 
                    className='object-cover rounded-t-lg' 
                />
            </div>
            <div className='w-full h-[30%] p-[10px]'>
                {brand}
            </div>
        </InteractiveCar>
    );
}
