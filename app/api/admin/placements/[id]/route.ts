// FILE: app/api/admin/placements/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single placement with full details
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const placement = await prisma.placement.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        },
        carrier: {
          select: {
            id: true,
            name: true,
            carrierId: true
          }
        },
        agency: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true
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
          take: 50
        }
      }
    });

    if (!placement) {
      return NextResponse.json({ error: 'Placement not found' }, { status: 404 });
    }

    return NextResponse.json(placement);
  } catch (error) {
    console.error('Error fetching placement:', error);
    return NextResponse.json({ error: 'Failed to fetch placement' }, { status: 500 });
  }
}

// PUT update single placement
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete body.id;
    delete body.user;
    delete body.carrier;
    delete body.agency;
    delete body.notes;
    delete body.activities;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.referenceNumber; // Prevent changing reference number

    const placement = await prisma.placement.update({
      where: { id: params.id },
      data: body
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        placementId: params.id,
        action: 'admin_update_placement',
        details: { 
          updatedFields: Object.keys(body)
        }
      }
    });

    return NextResponse.json(placement);
  } catch (error) {
    console.error('Error updating placement:', error);
    return NextResponse.json({ error: 'Failed to update placement' }, { status: 500 });
  }
}

// DELETE single placement
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get placement details before deletion for logging
    const placement = await prisma.placement.findUnique({
      where: { id: params.id },
      select: {
        referenceNumber: true,
        businessName: true
      }
    });

    if (!placement) {
      return NextResponse.json({ error: 'Placement not found' }, { status: 404 });
    }

    // Delete related records first
    await prisma.activityLog.deleteMany({
      where: { placementId: params.id }
    });

    await prisma.note.deleteMany({
      where: { placementId: params.id }
    });

    // Delete the placement
    await prisma.placement.delete({
      where: { id: params.id }
    });

    // Log the deletion (without placementId since it's deleted)
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'admin_delete_placement',
        details: { 
          deletedPlacementId: params.id,
          referenceNumber: placement.referenceNumber,
          businessName: placement.businessName
        }
      }
    });

    return NextResponse.json({ 
      message: 'Placement deleted successfully',
      deletedPlacement: placement
    });
  } catch (error) {
    console.error('Error deleting placement:', error);
    return NextResponse.json({ error: 'Failed to delete placement' }, { status: 500 });
  }
}