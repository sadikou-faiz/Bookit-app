import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {

    try {
        const { email, companyName } = await request.json()

        if (!email || !companyName) {
            return NextResponse.json({ error: 'Email et nom de l\'entreprise sont requis.' },
                { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json({ message: 'Utilisateur non trouvé.' },
                { status: 404 });
        }

        const existingCompany = await prisma.company.findUnique({
            where: { name: companyName }
        })

        if (existingCompany) {
            return NextResponse.json(
                { message: 'Une entreprise avec ce nom existe déjà.' },
                { status: 409 }
            );
        }


        const newCompany = await prisma.company.create({
            data: {
                name: companyName,
                createdBy: { connect: { id: user.id } },
            }
        })

        return NextResponse.json(
            { message: 'Entreprise créée avec succès.', company: newCompany },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)
        const email = searchParams.get('email')

        if(!email){
            return NextResponse.json({ error: 'L\'email est requis.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where : {email}
        })

        if(!user){
            return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
        }

        const companies  = await prisma.company.findMany({
            where: {
                createdById: user.id
            }
        })

        return NextResponse.json(
            { companies},
            { status: 200 });

    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE (request : Request){
    try {
        const {id} = await request.json();
        
        const company = await prisma.company.findUnique({
            where : {id}
        })

        if(!company){
            return NextResponse.json({ message: 'Entreprise non trouvée' }, { status: 404 });
        }

        await prisma.user.updateMany({
            where: {companyId : id},
            data : { companyId : null}
        })

        await prisma.reservation.deleteMany({
            where: {
                room: {
                    companyId :id
                }
            }
        })

        await prisma.room.deleteMany({
            where: {
                companyId:id,
            }
        })

        await prisma.company.delete({
            where :{id}
        })

        return NextResponse.json({ message: 'Entreprise supprimée avec succes' }, { status: 200 });
    }catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH (request : Request){
    try {
        const {id , creatorEmail , employeeEmail , action} = await request.json()

        const creator = await prisma.user.findUnique({
            where : {email : creatorEmail}
        })

        if(!creator){
            return NextResponse.json({ message: 'Créateur non trouvé' }, { status: 404 });
        }

        const company = await prisma.company.findUnique({
            where : {id}
        })

        if(!company){
            return NextResponse.json({ message: 'Entreprise non trouvée' }, { status: 404 });
        }

        if(company.createdById !== creator.id){
            return NextResponse.json({ message:  'L\'utilisateur n\'est pas le créateur de l\'entreprise'  }, { status: 403 });
        }

        if(action === 'ADD'){
            let employee = await prisma.user.findUnique({
                where : {email : employeeEmail}
            })

            if(employee?.companyId === company.id){
                return NextResponse.json({ message: `${employeeEmail} est déjà dans l'entreprise` }, { status: 400 });
            }

            if(employee?.companyId &&  employee.companyId !== company.id){
                return NextResponse.json({ message: `Cet employé appartient déjà à une autre entreprise.` }, { status: 400 });
            }

            if(!employee){
                employee = await prisma.user.create({
                    data : {
                        email : employeeEmail,
                        companyId : company.id
                    }
                })
            }else {
                await prisma.user.update({
                    where : {id: employee.id},
                    data: {
                        companyId : company.id
                    }
                })
            }

            await prisma.company.update({
                where : {id: company.id},
                data: {
                    employees : {
                        connect : {id : employee.id}
                    }
                }
            }) 
            return NextResponse.json({ message: 'Employé ajouté avec succès' }, { status: 201 });
    


        }else if(action === 'DELETE'){
            let employee = await prisma.user.findUnique({
                where : {email : employeeEmail}
            })

            if(!employee){
                return NextResponse.json({ message: 'Employé non trouvé' }, { status: 404 });
            }

            await prisma.company.update({
                where : {id: company.id},
                data : {
                    employees : {
                        disconnect : {id:employee.id}
                    }
                }
            })

            return NextResponse.json({ message: 'Employé supprimé avec succès' }, { status: 200 });

        }  
    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

