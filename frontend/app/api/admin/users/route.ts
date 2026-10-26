import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, hashPassword } from '@/lib/server/auth';
import { getAllUsers, createUser, getUserByEmail } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(auth.errorResponse, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const users = await getAllUsers(query);
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch users.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(auth.errorResponse, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, username, password, role = 'customer', phone = '', address = '' } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUser({
      name: name.trim(),
      email: cleanEmail,
      username: username?.trim() || cleanEmail.split('@')[0],
      password_hash: passwordHash,
      role: role === 'admin' ? 'admin' : 'customer',
      status: 'Active',
      phone: phone.trim(),
      address: address.trim(),
    });

    const { password_hash, ...safeUser } = newUser as any;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create user.' },
      { status: 500 }
    );
  }
}
