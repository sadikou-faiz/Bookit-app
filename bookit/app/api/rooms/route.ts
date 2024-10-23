import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {

        const { action, name, capacity, description, imageUrl, companyId, roomId } = await request.json()

        if (action === 'SAVE_DATA') {


            if (!name || !capacity || !companyId) {
                return NextResponse.json({ message: "Infos manquants" }, { status: 400 });
            }

            const existingRoom = await prisma.room.findFirst({
                where: {
                    name: name,
                    companyId: companyId
                }
            })

            if (existingRoom) {
                return NextResponse.json({ message: "Cette salle existe déjà pour cette entreprise." }, { status: 409 });
            }

            const newRoom = await prisma.room.create({
                data: {
                    name,
                    capacity: parseInt(capacity, 10),
                    description,
                    company: { connect: { id: companyId } }
                }
            })

            return NextResponse.json({ message: "Salle créée", roomId: newRoom.id }, { status: 201 });

        } else if (action === 'SAVE_IMAGE') {
            if (!roomId || !imageUrl) {
                return NextResponse.json({ message: 'L\'ID de la salle et l\'URL de l\'image sont requis.' }, { status: 400 });
            }

            const updatedRoom = await prisma.room.update({
                where: { id: roomId },
                data: {
                    imgUrl: imageUrl
                }
            })

            return NextResponse.json({ message: "Image mise à jour", roomdId: updatedRoom.id }, { status: 200 });

        }

    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const companyId = searchParams.get('companyId')

        if (!companyId) {
            return NextResponse.json({ message: "Id manquant" }, { status: 400 });
        }

        const rooms = await prisma.room.findMany({
            where : {
                companyId : companyId
            }
        })

        const company = await prisma.company.findUnique({
            where : {
                id : companyId
            }
        })

        return NextResponse.json({ rooms , companyName: company?.name }, { status: 200 });



    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {

        const {roomId}  = await request.json()

        
        if (!roomId) {
            return NextResponse.json({ message: "Id manquant" }, { status: 400 });
        }

        await prisma.room.delete({
            where : {id: roomId}
        })

        return NextResponse.json({ message: 'Salle supprimées avec succès'  }, { status: 200 });

        
    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
