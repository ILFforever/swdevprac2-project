'use client'
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import styles from '@/components/banner-search.module.css';

export default function Booking(){
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>()
    const venueItems = useAppSelector((state)=> state.bookSlice.bookItems)

    const timeOptions = [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
        '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
    ];

    const makeBooking = ()=>{
        if(nameLastname && tel && pickupDate && returnDate && pickupTime && returnTime){
            const item:BookingItem ={
                nameLastname: nameLastname,
                tel: tel,
                car: selectedCarId,
                bookDate: pickupDate.format("YYYY/MM/DD"),
                returnDate: returnDate.format("YYYY/MM/DD"),
                pickupTime: pickupTime,
                returnTime: returnTime
            }
            console.log(item)
            dispatch(addBooking(item))
        }
    }

    const [nameLastname, setNameLastname] = useState<string>('');
    const [tel, setTel] = useState<string>('');
    const [pickupDate, setPickupDate] = useState<Dayjs | null>(null);
    const [returnDate, setReturnDate] = useState<Dayjs | null>(null);
    const [pickupTime, setPickupTime] = useState<string>('10:00 AM');
    const [returnTime, setReturnTime] = useState<string>('10:00 AM');
    const [selectedCarId, setSelectedCarId] = useState<string>('');

    // Mock car data (in a real app, this would come from your state or API)
    const mockCars = [
        { id: '67e21e3aeb231df8f2cd6c38', brand: 'Mercedes', model: 'C-Class', dailyRate: 150, type: 'Sedan' },
        { id: 'car2', brand: 'BMW', model: '5 Series', dailyRate: 180, type: 'Sedan' },
        { id: 'car3', brand: 'Porsche', model: 'Cayenne', dailyRate: 250, type: 'SUV' },
    ];

    // Effect to handle URL parameters
    useEffect(() => {
        const carId = searchParams.get('carId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Prefill car selection if car ID matches
        if (carId) {
            const matchedCar = mockCars.find(car => car.id === carId);
            if (matchedCar) {
                setSelectedCarId(carId);
            }
        }

        // Prefill dates
        if (startDate) {
            setPickupDate(dayjs(startDate));
        }
        if (endDate) {
            setReturnDate(dayjs(endDate));
        }
    }, [searchParams]);

    return(
        <main className="max-w-6xl mx-auto py-10 px-4">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-medium mb-3">Make Your Reservation</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    Complete the details below to reserve your perfect vehicle
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Booking Form */}
                <div className="bg-white shadow-md rounded-lg p-8">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        makeBooking();
                    }} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 mb-2">Full Name</label>
                            <input 
                                type="text"
                                value={nameLastname}
                                onChange={(e) => setNameLastname(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Contact Number</label>
                            <input 
                                type="tel"
                                value={tel}
                                onChange={(e) => setTel(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Select Vehicle</label>
                            <select
                                value={selectedCarId}
                                onChange={(e) => setSelectedCarId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                                required
                            >
                                <option value="">Select a Vehicle</option>
                                {mockCars.map(car => (
                                    <option key={car.id} value={car.id}>
                                        {car.brand} {car.model} - ${car.dailyRate}/day
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Pickup Date & Time</label>
                            <div className={styles.dateTimeWrapper}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <div className={styles.datePickerContainer}>
                                        <DatePicker
                                            value={pickupDate}
                                            onChange={(newValue) => setPickupDate(newValue)}
                                            className={styles.datePicker}
                                            slotProps={{
                                                textField: {
                                                    variant: 'outlined',
                                                    fullWidth: true,
                                                    size: 'small',
                                                    InputProps: {
                                                        className: styles.datePickerInput,
                                                        endAdornment: null,
                                                        style: { 
                                                            fontSize: '14px',
                                                            padding: 0
                                                        }
                                                    }
                                                },
                                                field: {
                                                    shouldRespectLeadingZeros: true,
                                                    format: 'MM/DD/YYYY'
                                                }
                                            }}
                                        />
                                    </div>
                                </LocalizationProvider>
                                <select 
                                    value={pickupTime}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                    className={styles.timeSelect}
                                >
                                    {timeOptions.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Return Date & Time</label>
                            <div className={styles.dateTimeWrapper}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <div className={styles.datePickerContainer}>
                                        <DatePicker
                                            value={returnDate}
                                            onChange={(newValue) => setReturnDate(newValue)}
                                            className={styles.datePicker}
                                            slotProps={{
                                                textField: {
                                                    variant: 'outlined',
                                                    fullWidth: true,
                                                    size: 'small',
                                                    InputProps: {
                                                        className: styles.datePickerInput,
                                                        endAdornment: null,
                                                        style: { 
                                                            fontSize: '14px',
                                                            padding: 0
                                                        }
                                                    }
                                                },
                                                field: {
                                                    shouldRespectLeadingZeros: true,
                                                    format: 'MM/DD/YYYY'
                                                }
                                            }}
                                        />
                                    </div>
                                </LocalizationProvider>
                                <select 
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    className={styles.timeSelect}
                                >
                                    {timeOptions.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
                        >
                            Confirm Reservation
                        </button>
                    </form>
                </div>

                {/* Booking List */}
                <div>
                    <h2 className="text-2xl font-medium mb-6">Your Bookings</h2>
                    {venueItems.length === 0 ? (
                        <div className="bg-white shadow-md rounded-lg p-8 text-center">
                            <p className="text-gray-600">No bookings yet</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {venueItems.map((item, index) => {
                                        // Find the car details for this booking
                                        const car = mockCars.find(c => c.id === item.car);
                                        
                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.nameLastname}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.tel}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {car ? `${car.brand} ${car.model}` : 'Unknown Vehicle'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {item.bookDate} {item.pickupTime}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {item.returnDate} {item.returnTime}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}