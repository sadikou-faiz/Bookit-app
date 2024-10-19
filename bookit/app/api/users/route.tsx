import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ajustez le chemin si nécessaire

export async function POST(request: Request) {
  try {
    const { email, famillyName, givenName } = await request.json();

    // Vérifiez si les champs requis sont présents
    if (!email || !famillyName || !givenName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe dans la base de données
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          famillyName,
          givenName,
        },
      });
    } else {
      // Mettre à jour si famillyName ou givenName sont null
      if (user.famillyName == null || user.givenName == null) {
        user = await prisma.user.update({
          where: { email },
          data: {
            famillyName: user.famillyName ?? famillyName,
            givenName: user.givenName ?? givenName,
          },
        });
      }
    }

    // Vérifier si l'utilisateur est associé à une entreprise
    const company = await prisma.company.findFirst({
      where: {
        employees: {
          some: {
            id: user.id,
          },
        },
      },
    });

    // Renvoie l'ID de l'entreprise si l'utilisateur y est associé, sinon "nope"
    if (company) {
      return NextResponse.json({ companyId: company.id });
    } else {
      return NextResponse.json({ message: 'nope' });
    }
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
