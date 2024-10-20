import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function POST(request: Request) {
  try {
    const { email, famillyName, givenName } = await request.json();


    if (!email || !famillyName || !givenName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });


    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          famillyName,
          givenName,
        },
      });
    } else {
      
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

    const company = await prisma.company.findFirst({
      where: {
        employees: {
          some: {
            id: user.id,
          },
        },
      },
    });

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
