// FILE: app/api/admin/placements/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all placements with filtering and details
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minRevenue = searchParams.get('minRevenue');
    const maxRevenue = searchParams.get('maxRevenue');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) where.status = status;
    if (userId) where.userId = userId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    if (minRevenue || maxRevenue) {
      where.revenue = {};
      if (minRevenue) where.revenue.gte = parseFloat(minRevenue);
      if (maxRevenue) where.revenue.lte = parseFloat(maxRevenue);
    }

    const placements = await prisma.placement.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        carrier: {
          select: {
            id: true,
            name: true
          }
        },
        notes: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(placements);
  } catch (error) {
    console.error('Error fetching placements:', error);
    return NextResponse.json({ error: 'Failed to fetch placements' }, { status: 500 });
  }
}

// PUT update placement
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Placement ID is required' }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.user;
    delete updateData.carrier;
    delete updateData.notes;
    delete updateData.activities;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const placement = await prisma.placement.update({
      where: { id },
      data: updateData
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        placementId: id,
        action: 'admin_update_placement',
        details: { 
          updatedFields: Object.keys(updateData)
        }
      }
    });

    return NextResponse.json(placement);
  } catch (error) {
    console.error('Error updating placement:', error);
    return NextResponse.json({ error: 'Failed to update placement' }, { status: 500 });
  }
}

// DELETE placement
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Placement ID is required' }, { status: 400 });
    }

    // Delete related records first
    await prisma.activityLog.deleteMany({
      where: { placementId: id }
    });

    await prisma.note.deleteMany({
      where: { placementId: id }
    });

    // Delete the placement
    await prisma.placement.delete({
      where: { id }
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'admin_delete_placement',
        details: { 
          deletedPlacementId: id
        }
      }
    });

    return NextResponse.json({ message: 'Placement deleted successfully' });
  } catch (error) {
    console.error('Error deleting placement:', error);
    return NextResponse.json({ error: 'Failed to delete placement' }, { status: 500 });
  }
}