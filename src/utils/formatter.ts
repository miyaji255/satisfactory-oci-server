import type { Database, Player } from '../types/database.ts';

export function getDefaultDatabase(): Database {
  return {
    server: {
      version: '',
      online: false,
      unreachable: false,
    },
    players: {},
  };
}

export function formatList(list: readonly string[]): string {
  const formatter = new Intl.ListFormat('ja', { style: 'long', type: 'disjunction' });
  return formatter.format([...list].sort());
}

export function formatMinutes(minutes: number): string {
  const remainingDays = Math.floor(minutes / 1440);
  const remainingHours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;

  const parts: string[] = [];
  if (remainingDays > 0) {
    parts.push(`${remainingDays}日`);
  }
  if (remainingHours > 0) {
    parts.push(`${remainingHours}時間`);
  }
  parts.push(`${remainingMinutes}分`);

  return parts.join('');
}

export function formatPlayers(players: readonly Player[]): string {
  const formatter = new Intl.ListFormat('ja', { style: 'long', type: 'conjunction' });
  return formatter.format(
    players
      .map(({ name }) => name)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
  );
}

export function getOnlinePlayers(db: Database): Player[] {
  return Object.values(db.players).filter((player) => player.joined > 0);
}

export function getTimestamp(): string {
  return `<t:${Math.floor(Date.now() / 1000)}>`;
}
