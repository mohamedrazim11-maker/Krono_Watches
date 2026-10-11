import { NextRequest, NextResponse } from 'next/server';
import {
  getUserFromRequest,
  comparePassword,
  hashPassword,
  PASSWORD_REGEX,
} from '@/lib/server/auth';
import { getUserById, updateUser } from '@/lib/server/db';

export async function PUT(req: NextRequest) {
  try {
    const { user } = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmNewPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            'All password fields (currentPassword, newPassword, confirmNewPassword) are required.',
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { success: false, message: 'New passwords do not match.' },
        { status: 400 }
      );
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'New password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.',
        },
        { status: 400 }
      );
    }

    const fullUser = await getUserById(user.id);
    if (!fullUser) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    const isMatch = await comparePassword(currentPassword, fullUser.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Incorrect current password.' },
        { status: 401 }
      );
    }

    const newHashed = await hashPassword(newPassword);
    await updateUser(user.id, { password_hash: newHashed });

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated. Security credentials refreshed.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
