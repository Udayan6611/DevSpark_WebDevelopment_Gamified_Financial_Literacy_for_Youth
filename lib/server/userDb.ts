import { promises as fs } from 'fs';
import path from 'path';
import { UserProfile } from '@/store/useStore';
import { getSupabaseServerClient } from '@/lib/server/supabase';

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  profile: UserProfile;
  createdAt: number;
}

interface DbUserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  profile: UserProfile;
  created_at: string;
}

const dbPath = path.join(process.cwd(), 'data', 'users.json');

function mapRowToStoredUser(row: DbUserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    profile: row.profile,
    createdAt: Number.isNaN(Date.parse(row.created_at))
      ? Date.now()
      : Date.parse(row.created_at),
  };
}

// Local JSON fallback for local dev
async function readUsersLocal(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(dbPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsersLocal(users: StoredUser[]): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(users, null, 2), 'utf8');
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase getUserByEmail failed: ${error.message}`);
    }

    return data ? mapRowToStoredUser(data as DbUserRow) : null;
  }

  const users = await readUsersLocal();
  const match = users.find(
    (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
  );
  return match ?? null;
}

export async function getUserById(userId: string): Promise<StoredUser | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase getUserById failed: ${error.message}`);
    }

    return data ? mapRowToStoredUser(data as DbUserRow) : null;
  }

  const users = await readUsersLocal();
  const match = users.find((u) => u.id === userId);
  return match ?? null;
}

export async function getUserByUsername(username: string): Promise<StoredUser | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username.trim())
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase getUserByUsername failed: ${error.message}`);
    }

    return data ? mapRowToStoredUser(data as DbUserRow) : null;
  }

  const users = await readUsersLocal();
  const match = users.find(
    (u) => u.username.trim().toLowerCase() === username.trim().toLowerCase()
  );
  return match ?? null;
}

export async function createUser(user: StoredUser): Promise<void> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      username: user.username,
      password_hash: user.passwordHash,
      profile: user.profile,
      created_at: new Date(user.createdAt).toISOString(),
    });

    if (error) {
      throw new Error(`Supabase createUser failed: ${error.message}`);
    }

    return;
  }

  const users = await readUsersLocal();
  users.push(user);
  await writeUsersLocal(users);
}

export async function updateUserProfile(
  userId: string,
  profile: UserProfile
): Promise<UserProfile | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .update({
        username: profile.username,
        profile,
      })
      .eq('id', userId)
      .select('profile')
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase updateUserProfile failed: ${error.message}`);
    }

    return (data?.profile as UserProfile | undefined) ?? null;
  }

  const users = await readUsersLocal();
  const index = users.findIndex((u) => u.id === userId);
  if (index < 0) {
    return null;
  }

  users[index] = {
    ...users[index],
    username: profile.username,
    profile,
  };

  await writeUsersLocal(users);
  return users[index].profile;
}

export async function getLeaderboardProfiles(limit = 20): Promise<UserProfile[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('profile');

    if (error) {
      throw new Error(`Supabase getLeaderboardProfiles failed: ${error.message}`);
    }

    const profiles = (data ?? [])
      .map((row) => row.profile as UserProfile)
      .filter(Boolean)
      .sort((a, b) => {
        if (b.totalXP !== a.totalXP) {
          return b.totalXP - a.totalXP;
        }
        if (b.quizzesCompleted !== a.quizzesCompleted) {
          return b.quizzesCompleted - a.quizzesCompleted;
        }
        return b.longestStreak - a.longestStreak;
      })
      .slice(0, limit);

    return profiles;
  }

  const users = await readUsersLocal();

  return users
    .map((u) => u.profile)
    .sort((a, b) => {
      if (b.totalXP !== a.totalXP) {
        return b.totalXP - a.totalXP;
      }
      if (b.quizzesCompleted !== a.quizzesCompleted) {
        return b.quizzesCompleted - a.quizzesCompleted;
      }
      return b.longestStreak - a.longestStreak;
    })
    .slice(0, limit);
}
