'use client'
import Form from "@/components/DateReserve"
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import getUserProfile from "@/libs/getUserProfile";
import { TextField } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";

export default function Booking(){
    // const session = await getServerSession(authOptions)
    // if(!session||!session.user.token) return null

    // const profile=await getUserProfile(session.user.token)
    // var createdAt = new Date(profile.data.createdAt)
    const dispatch = useDispatch<AppDispatch>()

    const makeBooking = ()=>{
        if(nameLastname && tel && venue && bookDate){
            const item:BookingItem ={
                nameLastname: nameLastname,
                tel: tel,
                venue: venue,
                bookDate: dayjs(bookDate).format("YYYY/MM/DD"),
            }
            console.log(item)
            dispatch(addBooking(item))
        }
        
    }

    const [nameLastname, setNameLastname] = useState<string>('');
    const [tel, setTel] = useState<string>('');
    const [venue, setVenue] = useState<string>('');
    const [bookDate, setBookDate] = useState<Dayjs | null>(null);

    return(
        <main className="w-[100%] flex flex-col items-center space-y-4">
            <TextField name="Name-Lastname" label="Name-Lastname" variant="standard" onChange={(event)=>{setNameLastname(event.target.value)}}></TextField>
            <TextField name="Contact-Number" label="Contact-Number" variant="standard" onChange={(event)=>{setTel(event.target.value)}}></TextField>
            <div>
            Start Rent Date<Form onDateChange={(value:Dayjs)=>{setBookDate(value)}} onVenueChange={setVenue}/>
            Return Date<Form onDateChange={(value:Dayjs)=>{setBookDate(value)}} onVenueChange={setVenue}/>
            </div>
            
            <button name="Book Venue" className="block rounded-md bg-sky-600 hover:bg-indigo-600 px-3 py-2 text-white shadow-sm " onClick={makeBooking} >Confirm car rent</button>
        </main>
    );
}