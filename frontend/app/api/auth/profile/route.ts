import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getUserById, updateUser } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const { user } = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const fullUser = await getUserById(user.id);
    if (!fullUser) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        phone: fullUser.phone || null,
        address: fullUser.address || null,
        secondary_address: fullUser.secondary_address || null,
        avatar: fullUser.avatar || '/assets/u1.svg',
        role: fullUser.role || 'authenticated',
        status: fullUser.status || 'Active Member',
        created_at: fullUser.created_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const allowed = ['name', 'phone', 'address', 'secondary_address'];
    const fieldsToUpdate: any = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        fieldsToUpdate[key] = body[key];
      }
    }

    const updated = await updateUser(user.id, fieldsToUpdate);
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || null,
        address: updated.address || null,
        secondary_address: updated.secondary_address || null,
        avatar: updated.avatar || '/assets/u1.svg',
        role: updated.role || 'authenticated',
        status: updated.status || 'Active Member',
        created_at: updated.created_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
