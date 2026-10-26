import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailOrUsername, updateUser } from '@/lib/server/db';
import { hashPassword, PASSWORD_REGEX } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, identity, newPassword, confirmNewPassword } = body;

    const targetIdentity = (email || identity || '').trim().toLowerCase();
    if (!targetIdentity) {
      return NextResponse.json(
        { success: false, message: 'Please provide your registered email address or username.' },
        { status: 400 }
      );
    }

    const user = await getUserByEmailOrUsername(targetIdentity);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No registered account found with that email address.' },
        { status: 404 }
      );
    }

    // If newPassword is provided, perform the reset
    if (newPassword !== undefined) {
      if (!newPassword) {
        return NextResponse.json(
          { success: false, message: 'New password cannot be empty.' },
          { status: 400 }
        );
      }

      if (!PASSWORD_REGEX.test(newPassword)) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
          },
          { status: 400 }
        );
      }

      if (confirmNewPassword && newPassword !== confirmNewPassword) {
        return NextResponse.json(
          { success: false, message: 'Passwords do not match.' },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(newPassword);
      await updateUser(user.id, { password_hash: passwordHash });

      return NextResponse.json({
        success: true,
        message: 'Your password has been reset successfully. You can now sign in.',
      });
    }

    // Step 1: Verification check
    return NextResponse.json({
      success: true,
      exists: true,
      email: user.email,
      name: user.name || 'Client',
      message: 'Account verified. You may now enter your new security password.',
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during password reset.' },
      { status: 500 }
    );
  }
}
