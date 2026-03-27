import { NextResponse } from 'next/server';
import { getLeaderboardProfiles } from '@/lib/server/userDb';

export async function GET() {
  const profiles = await getLeaderboardProfiles(20);

  const rivals = [
    { username: 'Sarah', level: 9, totalXP: 9300, quizzesCompleted: 42, longestStreak: 18 },
    { username: 'Alex', level: 8, totalXP: 8100, quizzesCompleted: 37, longestStreak: 14 },
    { username: 'Jordan', level: 7, totalXP: 7600, quizzesCompleted: 35, longestStreak: 16 },
    { username: 'Morgan', level: 7, totalXP: 7050, quizzesCompleted: 30, longestStreak: 12 },
    { username: 'Casey', level: 6, totalXP: 6100, quizzesCompleted: 28, longestStreak: 9 },
  ];

  const merged = [
    ...rivals,
    ...profiles.map((p) => ({
      username: p.username,
      level: p.level,
      totalXP: p.totalXP,
      quizzesCompleted: p.quizzesCompleted,
      longestStreak: p.longestStreak,
    })),
  ];

  const byName = new Map<string, (typeof merged)[number]>();
  for (const item of merged) {
    byName.set(item.username.trim().toLowerCase(), item);
  }

  const sorted = Array.from(byName.values()).sort((a, b) => {
    if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
    if (b.quizzesCompleted !== a.quizzesCompleted) return b.quizzesCompleted - a.quizzesCompleted;
    return b.longestStreak - a.longestStreak;
  });

  return NextResponse.json({ entries: sorted }, { status: 200 });
}
