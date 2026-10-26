import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, hashPassword } from '@/lib/server/auth';
import { updateUser, deleteUser, getUserById } from '@/lib/server/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(auth.errorResponse, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields = ['name', 'phone', 'address', 'secondary_address', 'role', 'status'];
    const fieldsToUpdate: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        fieldsToUpdate[field] = body[field];
      }
    }

    if (body.password) {
      fieldsToUpdate.password_hash = await hashPassword(body.password);
    }

    const updated = await updateUser(id, fieldsToUpdate);
    const { password_hash, ...safeUser } = updated as any;

    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update user.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(auth.errorResponse, { status: 403 });
  }

  try {
    const { id } = await params;

    // Guard against deleting oneself
    if (auth.user?.id === id) {
      return NextResponse.json(
        { success: false, message: 'You cannot delete your own logged-in administrator account.' },
        { status: 400 }
      );
    }

    const result = await deleteUser(id);
    return NextResponse.json({ success: true, message: 'User removed successfully.', data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete user.' },
      { status: 400 }
    );
  }
}
