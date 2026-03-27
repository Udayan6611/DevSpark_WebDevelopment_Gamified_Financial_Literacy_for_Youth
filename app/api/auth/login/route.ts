import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/server/userDb';
import {
  getAuthCookieName,
  getAuthCookieOptions,
  signAuthToken,
} from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const res = NextResponse.json({ user: user.profile });
    res.cookies.set(getAuthCookieName(), token, getAuthCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: 'Failed to log in.' }, { status: 500 });
  }
}
