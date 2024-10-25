"use client"
import Wrapper from '@/app/components/Wrapper';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import React, { useEffect, useState } from 'react'
import Notification from '@/app/components/Notification'
import Image from 'next/image';
import { Clock7, Users } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: string;
  imgUrl: string
}

interface Reservation {
  startTime: string;
  endTime: string;
}

interface RoomData {
  room: Room;
  existingReservations: Reservation[]
}

const page = ({ params }: { params: { roomId: string } }) => {
  const { user } = useKindeBrowserClient();
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [mergedSlots, setMergedSlots] = useState<string[]>([])

  useEffect(() => {
    const today = new Date();
    const formatedDate = today.toISOString().split('T')[0];
    setSelectedDate(formatedDate)
  }, [])


  const [notification, setNotification] = useState<string>('')
  const closeNotification = () => {
    setNotification("")
  }

  useEffect(() => {
    if (selectedDate) {
      fetchRoomData()
    }
  }, [selectedDate])

  const fetchRoomData = async () => {
    try {
      const response = await fetch('/api/disponibilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: params.roomId,
          reservationDate: selectedDate.split('-').reverse().join('/')
        })
      })

      if (response.ok) {
        const data = await response.json()
        setRoomData(data)
        calculateAvailableSlots(data.existingReservations)
      } else {
        console.error('Erreur lors de la récupération des données de la salle.');
      }

    } catch (error) {
      console.error(error)
    }
  }

  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }


  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  const calculateAvailableSlots = (reservations: Reservation[]) => {
    const slots: string[] = []
    const workingHours = [{ start: '09:00', end: '23:00' }]
    const today = new Date()
    const selectedDateObj = new Date(selectedDate)

    const now = today.getHours() * 60 + today.getMinutes()

    workingHours.forEach(({ start, end }) => {
      const startTime = parseTime(start)
      const endTime = parseTime(end)

      for (let time = startTime; time < endTime; time += 30) {
        const slotStart = formatTime(time)
        const slotEnd = formatTime(time + 30)


        const istoday = selectedDateObj.toDateString() === today.toDateString();

        const isPastSlot = istoday && time < now

        const isReserved = reservations.some(({ startTime, endTime }) =>
          time < parseTime(endTime) && time + 30 > parseTime(startTime)
        )

        if (!isReserved && !isPastSlot) {
          slots.push(`${slotStart} - ${slotEnd}`)
        }
      }
    })

    setAvailableSlots(slots)
  }

  console.log(availableSlots)

  const isSlotSelected = (slot: string) => {
    return selectedSlots.includes(slot);
  }

  const handleSlotClick = (slot: string) => {
    let updatedSlots: string[]

    console.log(slot)

    if (selectedSlots.includes(slot)) {
      updatedSlots = selectedSlots.filter((s) => s !== slot)
    } else {
      updatedSlots = [...selectedSlots, slot]
    }

    updatedSlots.sort((a, b) => parseTime(a.split(" - ")[0]) - parseTime(b.split(" - ")[0]))

    const merged = mergeConsecutiveSlots(updatedSlots)
    setMergedSlots(merged)

    setSelectedSlots(updatedSlots)
  }

  const mergeConsecutiveSlots = (slots: string[]) => {
    if (slots.length === 0) return []
    const mergedSlots: string[] = []

    let start = slots[0].split(" - ")[0]
    let end = slots[0].split(" - ")[1]

    for (let i = 1; i < slots.length; i++) {
      const [currentStart, currentEnd] = slots[i].split(" - ")
      if (end === currentStart) {
        end = currentEnd
      } else {
        mergedSlots.push(`${start} - ${end}`);
        start = currentStart
        end = currentEnd
      }
    }

    mergedSlots.push(`${start} - ${end}`);
    return mergedSlots
  }

  const handleReservation = async () => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user?.email,
          roomId: params.roomId,
          reservationDate: selectedDate.split('-').reverse().join('/'),
          timeSlots: mergedSlots
        })
      })

      if (response.ok) {
        setNotification('Réservation réussie !')
        fetchRoomData()
        setSelectedSlots([])
        setMergedSlots([])
      } else {
        console.error('Erreur lors de la réservation.');
      }
    } catch (error) {
      console.error(error)
    }

  }

  return (
    <Wrapper>

      {notification && (
        <Notification message={notification} onclose={closeNotification}></Notification>
      )}

      <div>
        <h1 className='text-2xl mb-4'> Réserver cette salle </h1>
        {roomData && (
          <div className='flex'>
            <div className="w-full h-fit">

              {mergedSlots.length > 0 && (
                <ul className='hidden md:flex flex-wrap gap-1 mb-4 items-center'>
                  Créneaux choisis :
                  {mergedSlots.map((mergedSlot, index) => (
                    <li key={index} className='badge badge-ghost'>{mergedSlot}</li>
                  ))}
                </ul>
              )}

              <div className='flex'>
                <div className='md:border-base-300 md:border md:rounded-xl md:p-5 h-fit md:w-1/3'>
                  <Image src={roomData.room.imgUrl ? roomData.room.imgUrl : '/placeholder.jpg'} alt={roomData.room.id}
                    width={400}
                    height={400}
                    quality={100}
                    className='shadow-sm w-full  h-48 object-cover rounded-xl'
                  >
                  </Image>

                  <div className='flex items-center mt-4'>
                    <div className='badge badge-secondary'>
                      <Users className='mr-2 w-4' />
                      {roomData.room.capacity}
                    </div>
                    <h1 className='font-bold text-xl ml-2'>
                      {roomData.room.name}
                    </h1>
                  </div>

                  <p className='text-sm my-2 text-gray-500'>
                    {roomData.room.description}
                  </p>

                  <button className="btn btn-outline mt-4 btn-sm btn-secondary md:hidden block" onClick={() => (document.getElementById('my_modal') as HTMLDialogElement).showModal()}>Choisir un créneau</button>

                </div>
                <div className='hidden md:block ml-4 w-2/3 '>
                  <div className='flex'>
                    <input
                      type="date"
                      value={selectedDate}
                      placeholder='choissisez une date'
                      className='input input-bordered w-full'
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                      }}
                    />
                    <button
                      className='btn btn-secondary ml-4'
                      disabled={mergedSlots.length === 0}
                      onClick={handleReservation}
                    >
                      Réserver
                    </button>
                  </div>

                  <ul className='grid grid-cols-2 gap-4 mt-4'>
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, index) => (
                        <button
                          className={`btn w-full btn-md ${isSlotSelected(slot) ? 'btn-secondary' : 'btn-outline btn-ghost border border-base-300 text-gray-500 hover:bg-secondary hover:border-secondary'} `}
                          onClick={() => handleSlotClick(slot)}
                        >
                          <Clock7 className='w-4' /> {slot}
                        </button>
                      ))
                    ) : (
                      <p className=''>Aucun créneau disponible.</p>
                    )}
                  </ul>

                </div>
              </div>

            </div>



            <dialog id="my_modal" className="modal">
              <div className="modal-box">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div className='w-full mt-5 '>

                  {mergedSlots.length > 0 && (
                    <ul className='flex flex-wrap gap-1 mb-4 items-center'>
                      Créneaux choisis :
                      {mergedSlots.map((mergedSlot, index) => (
                        <li key={index} className='badge badge-ghost'>{mergedSlot}</li>
                      ))}
                    </ul>
                  )}
                  <div className='flex'>
                    <input
                      type="date"
                      value={selectedDate}
                      placeholder='choissisez une date'
                      className='input input-bordered w-full'
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                      }}
                    />
                    <button
                      className='btn btn-secondary ml-4'
                      disabled={mergedSlots.length === 0}
                      onClick={handleReservation}
                    >
                      Réserver
                    </button>
                  </div>

                  <ul className='grid grid-cols-2 gap-4 mt-4'>
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, index) => (
                        <button
                          className={`btn w-full btn-md ${isSlotSelected(slot) ? 'btn-secondary' : 'btn-outline btn-ghost border border-base-300 text-gray-500 hover:bg-secondary hover:border-secondary'} `}
                          onClick={() => handleSlotClick(slot)}
                        >
                          <Clock7 className='w-4' /> {slot}
                        </button>
                      ))
                    ) : (
                      <p className=''>Aucun créneau disponible.</p>
                    )}
                  </ul>

                </div>
              </div>
            </dialog>

          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default page
