import { describe, expect, test } from 'bun:test';
import {
  formatList,
  formatMinutes,
  formatPlayers,
  getOnlinePlayers,
  getDefaultDatabase,
} from './formatter.ts';
import type { Database } from '../types/database.ts';

describe('Formatter', () => {
  describe('formatList', () => {
    test('formats single item list', () => {
      const result = formatList(['INVALID']);
      expect(result).toBe('INVALID');
    });

    test('formats two item list with disjunction', () => {
      const result = formatList(['INVALID', 'UNKNOWN']);
      expect(result).toBe('INVALIDまたはUNKNOWN');
    });

    test('formats multiple item list', () => {
      const result = formatList(['C', 'A', 'B']);
      expect(result).toBe('A、B、またはC');
    });
  });

  describe('formatMinutes', () => {
    test('formats minutes only', () => {
      expect(formatMinutes(5)).toBe('5分');
      expect(formatMinutes(59)).toBe('59分');
    });

    test('formats hours and minutes', () => {
      expect(formatMinutes(60)).toBe('1時間0分');
      expect(formatMinutes(90)).toBe('1時間30分');
      expect(formatMinutes(150)).toBe('2時間30分');
    });

    test('formats days, hours, and minutes', () => {
      expect(formatMinutes(1440)).toBe('1日0分');
      expect(formatMinutes(1500)).toBe('1日1時間0分');
      expect(formatMinutes(1530)).toBe('1日1時間30分');
      expect(formatMinutes(2880 + 120 + 45)).toBe('2日2時間45分');
    });

    test('handles zero minutes', () => {
      expect(formatMinutes(0)).toBe('0分');
    });
  });

  describe('formatPlayers', () => {
    test('formats single player', () => {
      const players = [
        { userId: '1', name: 'Alice', joinRequested: 1, joined: 1 },
      ];
      const result = formatPlayers(players);
      expect(result).toBe('Alice');
    });

    test('formats multiple players alphabetically', () => {
      const players = [
        { userId: '1', name: 'Charlie', joinRequested: 1, joined: 1 },
        { userId: '2', name: 'Alice', joinRequested: 1, joined: 1 },
        { userId: '3', name: 'Bob', joinRequested: 1, joined: 1 },
      ];
      const result = formatPlayers(players);
      expect(result).toBe('Alice、Bob、Charlie');
    });

    test('handles empty player list', () => {
      const result = formatPlayers([]);
      expect(result).toBe('');
    });
  });

  describe('getOnlinePlayers', () => {
    test('returns only players with joined > 0', () => {
      const db: Database = {
        server: { version: '1.0', online: true, unreachable: false },
        players: {
          '1': { userId: '1', name: 'OnlinePlayer', joinRequested: 1, joined: 1 },
          '2': { userId: '2', name: 'OfflinePlayer', joinRequested: 1, joined: 0 },
          '3': { userId: '3', name: 'AnotherOnline', joinRequested: 1, joined: 2 },
        },
      };
      const result = getOnlinePlayers(db);
      expect(result.length).toBe(2);
      expect(result.map((p) => p.name)).toEqual(['OnlinePlayer', 'AnotherOnline']);
    });

    test('returns empty array when no players are online', () => {
      const db: Database = {
        server: { version: '1.0', online: true, unreachable: false },
        players: {
          '1': { userId: '1', name: 'Player1', joinRequested: 1, joined: 0 },
          '2': { userId: '2', name: 'Player2', joinRequested: 0, joined: 0 },
        },
      };
      const result = getOnlinePlayers(db);
      expect(result.length).toBe(0);
    });

    test('returns empty array for empty database', () => {
      const db = getDefaultDatabase();
      const result = getOnlinePlayers(db);
      expect(result.length).toBe(0);
    });
  });

  describe('getDefaultDatabase', () => {
    test('returns default database structure', () => {
      const db = getDefaultDatabase();

      expect(db.server.version).toBe('');
      expect(db.server.online).toBe(false);
      expect(db.server.unreachable).toBe(false);
      expect(Object.keys(db.players)).toHaveLength(0);
    });
  });
});
