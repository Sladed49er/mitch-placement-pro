// FILE: app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET all users with filtering
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) where.role = role;
    if (isActive !== null) where.isActive = isActive === 'true';

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        title: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: { 
            placements: true,
            activities: true,
            notes: true
          }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST create new user
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name, role, phone, title, isActive } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: role || 'broker',
        phone,
        title,
        isActive: isActive !== false
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'admin_create_user',
        details: { 
          createdUserId: user.id,
          createdUserEmail: user.email
        }
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, email, name, role, password, phone, title, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent self-demotion
    if (id === session.user.id && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot change your own admin role' }, { status: 400 });
    }

    // Prevent self-deactivation
    if (id === session.user.id && isActive === false) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 });
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (phone !== undefined) updateData.phone = phone;
    if (title !== undefined) updateData.title = title;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'admin_update_user',
        details: { 
          updatedUserId: user.id,
          changes: Object.keys(updateData)
        }
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check if user has placements
    const userWithPlacements = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { placements: true }
        }
      }
    });

    if (!userWithPlacements) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userWithPlacements._count.placements > 0) {
      // Soft delete by deactivating instead of hard delete
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });

      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'admin_deactivate_user',
          details: { 
            deactivatedUserId: id,
            reason: 'Has existing placements'
          }
        }
      });

      return NextResponse.json({ 
        message: 'User deactivated (has placements)', 
        user 
      });
    }

    // Hard delete if no placements
    await prisma.user.delete({
      where: { id }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'admin_delete_user',
        details: { deletedUserId: id }
      }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}