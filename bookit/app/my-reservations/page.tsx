"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import Image from 'next/image';
import { CalendarDays, Clock3, Users } from 'lucide-react';

interface Room {
    id: string;
    name: string;
    capacity: number;
    description: string;
    imgUrl: string;
}

interface Reservation {
    id: string;
    room: Room;
    reservationDate: string;
    startTime: string;
    endTime: string;
}
interface ApiResponse {
    reservationWithoutUserId: Reservation[]
}

const page = () => {
    const [loading, setLoading] = React.useState<boolean>(true);
    const { user } = useKindeBrowserClient();
    const [reservations, setReservations] = useState<Reservation[]>([])

    
  const cleanupExpiredReservations = async () => {
    try {
      await fetch('/api/cleanupReservations' , {
        method: 'DELETE'
      })
    } catch (error) {
       console.error(error)
    }
}


    const fetchReservations = async () => {
        if (!user?.email) return
        try {
            const response = await fetch(`/api/reservations?email=${user?.email}`)
            const data: ApiResponse = await response.json()
            setReservations(data.reservationWithoutUserId)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    }

    console.log(reservations)

    const deleteReservation = async ( id : string) => {
        try {
            const response = await fetch('/api/reservations', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id
                })
            })

            if (response.ok) {
                fetchReservations()
                return
            }else {
                console.error('Failed to delete reservation')
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchReservations() ,
       cleanupExpiredReservations()
    }, [user])
    return (
        <Wrapper>
            {loading ? (
                <div className="text-center ">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div>
                    <h1 className='text-2xl mb-4'>Mes réservations</h1>
                    {reservations.length === 0 ? (
                        <p>Aucune réservation trouvée.</p>
                    ) : (
                        <ul className='grid md:grid-cols-2 gap-4'>
                            {reservations.map((reservation) => (
                                <li key={reservation.id} className='flex items-center mb-5 border-base-300 border p-5 rounded-2xl w-full h-60'>
                                    <Image src={reservation.room.imgUrl ? reservation.room.imgUrl : '/placeholder.jpg'} alt={reservation.room.id}
                                        width={400}
                                        height={400}
                                        quality={100}
                                        className=' shadow-sm w-1/3 h-full object-cover rounded-xl'
                                    ></Image>
                                    <div className='ml-6'>
                                        <div className='flex flex-col md:flex-row md:items-center'>
                                            <div className='badge badge-secondary'>
                                                <Users className='mr-2 w-4' />
                                                {reservation.room.capacity}
                                            </div>
                                            <h1 className='font-bold text-xl ml-2'>
                                                {reservation.room.name}
                                            </h1>
                                        </div>
                                        <div className='my-2'>
                                            <p className='flex'>
                                                <CalendarDays className='w-4 text-secondary' />
                                                <span className='ml-1'>{reservation.reservationDate}</span>
                                            </p>

                                            <p className='flex'>
                                                <Clock3 className='w-4 text-secondary' />
                                                <span className='ml-1'>{reservation.startTime} - {reservation.endTime}</span>
                                            </p>
                                            <button
                                                className='btn btn-outline btn-sm mt-2 btn-secondary'
                                                onClick={() => deleteReservation(reservation.id)}
                                            >
                                                Libérer
                                            </button>
                                        </div>

                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

        </Wrapper>
    )
}

export default page
