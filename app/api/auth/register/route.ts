// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, name, agencyName } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agency if provided
    let agencyId = null;
    if (agencyName) {
      const agency = await prisma.agency.create({
        data: {
          name: agencyName,
          primaryContact: name
        }
      });
      agencyId = agency.id;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        agencyId,
        role: agencyId ? 'agency_manager' : 'broker'
      }
    });

    // Log the registration
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'registration',
        details: { method: 'email' }
      }
    });

    return NextResponse.json({
      message: 'User created successfully',
      userId: user.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}