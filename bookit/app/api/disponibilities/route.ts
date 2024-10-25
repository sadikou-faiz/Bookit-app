
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { roomId, reservationDate } = await request.json()

        if (!roomId || !reservationDate) {
            return NextResponse.json({ message: 'Tous les champs sont requis' }, { status: 400 });
        }

        const dateParts = reservationDate.split('/')
        if (dateParts.length !== 3 || dateParts[2].length !== 4) {
            return NextResponse.json({ message: 'Format de date invalide. Utilisez le format dd/MM/yyyy.' }, { status: 400 });
        }  // 10/12/2004


        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`); // Conversion en objet Date

        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
            return NextResponse.json(
                { message: 'Date invalide.' },
                { status: 400 }
            );
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId }
        })

        if (!room) {
            return NextResponse.json(
                { message: 'Salle non trouvée.' },
                { status: 404 }
            );
        }

        const  existingReservations = await prisma.reservation.findMany({
             where : {
                roomId : roomId ,
                reservationDate : reservationDate
             },
             select: {
                  startTime:true,
                  endTime: true
             }
        })

        return NextResponse.json({ room , existingReservations}, { status: 200 });


    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

}