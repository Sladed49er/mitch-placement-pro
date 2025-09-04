// FILE: app/api/admin/carriers/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single carrier
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const carrier = await prisma.carrier.findUnique({
      where: { id }
    });

    if (!carrier) {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
    }

    return NextResponse.json(carrier);
  } catch (error) {
    console.error('Error fetching carrier:', error);
    return NextResponse.json({ error: 'Failed to fetch carrier' }, { status: 500 });
  }
}

// PUT update carrier
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Remove fields that shouldn't be updated
    delete body.id;
    delete body.carrierId; // Don't allow changing the carrier ID
    
    const carrier = await prisma.carrier.update({
      where: { id },
      data: body
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'update_carrier',
        details: {
          carrierId: carrier.carrierId,
          carrierName: carrier.name,
          updatedFields: Object.keys(body)
        }
      }
    });

    return NextResponse.json(carrier);
  } catch (error) {
    console.error('Error updating carrier:', error);
    return NextResponse.json({ error: 'Failed to update carrier' }, { status: 500 });
  }
}

// DELETE carrier (soft delete by setting inactive)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Instead of deleting, you might want to add an 'isActive' field
    // For now, we'll just return an error to prevent accidental deletion
    return NextResponse.json(
      { error: 'Carrier deletion is disabled for data integrity' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error deleting carrier:', error);
    return NextResponse.json({ error: 'Failed to delete carrier' }, { status: 500 });
  }
}