import { UserProfile } from '@/store/useStore';

const PLAYERS_KEY = 'finpath_players';

export function getStoredPlayers(): UserProfile[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function saveStoredPlayers(players: UserProfile[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

export function upsertStoredPlayer(player: UserProfile): void {
  const players = getStoredPlayers();
  const key = player.username.trim().toLowerCase();
  const existingIndex = players.findIndex(
    (p) => p.username.trim().toLowerCase() === key
  );

  if (existingIndex >= 0) {
    players[existingIndex] = {
      ...players[existingIndex],
      ...player,
    };
  } else {
    players.push(player);
  }

  saveStoredPlayers(players);
}
