import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/server/userDb';
import { isSupabaseConfigured } from '@/lib/server/supabase';
import {
  getAuthCookieName,
  getAuthCookieOptions,
  signAuthToken,
} from '@/lib/server/auth';
import { UserProfile } from '@/store/useStore';

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            'Supabase is not configured in production. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your hosting environment.',
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const username = String(body?.username ?? '').trim();
    const password = String(body?.password ?? '');

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Email, username, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    if (await getUserByEmail(email)) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    if (await getUserByUsername(username)) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }

    const userId = `user_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    const profile: UserProfile = {
      id: userId,
      username,
      level: 1,
      totalXP: 0,
      longestStreak: 0,
      currentStreak: 0,
      lastActiveDate: undefined,
      quizzesCompleted: 0,
      challengesCompleted: 0,
      achievements: [],
      createdAt: Date.now(),
    };

    await createUser({
      id: userId,
      email,
      username,
      passwordHash,
      profile,
      createdAt: Date.now(),
    });

    const token = await signAuthToken({
      sub: userId,
      email,
      username,
    });

    const res = NextResponse.json({ user: profile });
    res.cookies.set(getAuthCookieName(), token, getAuthCookieOptions());
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create account.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
