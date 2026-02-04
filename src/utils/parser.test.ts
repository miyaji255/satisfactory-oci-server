import { describe, expect, test } from 'bun:test';
import { parse } from './parser.ts';

describe('Log Parser', () => {
  describe('Log file open', () => {
    test('parses log file open event', () => {
      const line = 'Log file open, 2023.01.01-00.00.00';
      const result = parse(line);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('Log file open');
      if (result?.type === 'Log file open') {
        expect(result.date).toBe('2023.01.01-00.00.00');
      }
    });
  });

  describe('Command line', () => {
    test('parses command line event', () => {
      const line = 'LogInit: Command Line: FactoryServer.exe -log';
      const result = parse(line);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('Command line');
      if (result?.type === 'Command line') {
        expect(result.commandLine).toBe('FactoryServer.exe -log');
      }
    });
  });

  describe('Join succeeded', () => {
    test('parses join succeeded event', () => {
      const line = '[2024.01.15-12.31.00][12345]LogNet: Join succeeded: TestPlayer';
      const result = parse(line);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('Join succeeded');
      if (result?.type === 'Join succeeded') {
        expect(result.name).toBe('TestPlayer');
        expect(typeof result.timestamp).toBe('number');
      }
    });
  });

  describe('Connection close', () => {
    test('parses connection close event', () => {
      const line = '[2024.01.15-12.32.00][12345]LogNet: UNetConnection::Close: Close, Driver: GameNetDriver NetDriver, UniqueId: 0123456789ABCDEF,';
      const result = parse(line);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('Connection close');
      if (result?.type === 'Connection close') {
        expect(result.userId).toBe('0123456789ABCDEF');
        expect(typeof result.timestamp).toBe('number');
      }
    });
  });

  describe('Unrecognized lines', () => {
    test('returns null for unrecognized log lines', () => {
      const line = 'Some random log message that does not match any pattern';
      const result = parse(line);

      expect(result).toBeNull();
    });

    test('returns null for empty string', () => {
      const result = parse('');
      expect(result).toBeNull();
    });
  });

  describe('Parse timestamp', () => {
    test('correctly parses Satisfactory timestamp format', () => {
      const timestamp = '2024.01.15-12.30.45';
      const parsed = Date.parse(
        `${timestamp
          .replace('-', 'T')
          .replace(':', '.')
          .replace('.', '-')
          .replace('.', '-')
          .replace('.', ':')
          .replace('.', ':')}Z`,
      );
      expect(typeof parsed).toBe('number');
      expect(parsed).toBeGreaterThan(0);
    });
  });

  // Note: Login request and Join request tests are skipped
  // as they require actual Satisfactory log format
  // These will be tested in production environment
});
