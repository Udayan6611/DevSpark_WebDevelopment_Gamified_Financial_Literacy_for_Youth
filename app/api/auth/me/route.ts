import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '@/lib/server/auth';
import { getUserById } from '@/lib/server/userDb';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await getUserById(payload.sub);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: user.profile }, { status: 200 });
}
