import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '@/lib/server/auth';
import { getUserById, updateUserProfile } from '@/lib/server/userDb';
import { UserProfile } from '@/store/useStore';

function normalizeProfile(input: UserProfile, existing: UserProfile): UserProfile {
  return {
    ...existing,
    username: String(input.username || existing.username).trim().slice(0, 20),
    level: Number.isFinite(input.level) ? Math.max(1, Math.floor(input.level)) : existing.level,
    totalXP: Number.isFinite(input.totalXP) ? Math.max(0, Math.floor(input.totalXP)) : existing.totalXP,
    longestStreak: Number.isFinite(input.longestStreak)
      ? Math.max(0, Math.floor(input.longestStreak))
      : existing.longestStreak,
    currentStreak: Number.isFinite(input.currentStreak)
      ? Math.max(0, Math.floor(input.currentStreak))
      : existing.currentStreak,
    quizzesCompleted: Number.isFinite(input.quizzesCompleted)
      ? Math.max(0, Math.floor(input.quizzesCompleted))
      : existing.quizzesCompleted,
    challengesCompleted: Number.isFinite(input.challengesCompleted)
      ? Math.max(0, Math.floor(input.challengesCompleted))
      : existing.challengesCompleted ?? 0,
    achievements: Array.isArray(input.achievements) ? input.achievements : existing.achievements,
    lastActiveDate: input.lastActiveDate,
  };
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await getUserById(payload.sub);
  if (!existing) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const incoming = body?.profile as UserProfile | undefined;
  if (!incoming) {
    return NextResponse.json({ error: 'Profile is required.' }, { status: 400 });
  }

  const normalized = normalizeProfile(incoming, existing.profile);
  const updated = await updateUserProfile(existing.id, normalized);

  return NextResponse.json({ user: updated }, { status: 200 });
}
