import { describe, expect, test } from 'bun:test';
import { requiredOrigin } from '../src/origin.ts';

describe('requiredOrigin', () => {
  test('accepts an https origin', () => {
    expect(requiredOrigin('X', 'https://relic.example')).toBe(
      'https://relic.example'
    );
  });

  test('keeps the port, which a self-hosted deployment needs', () => {
    expect(requiredOrigin('X', 'https://relic.example:8443')).toBe(
      'https://relic.example:8443'
    );
  });

  test('drops a path rather than concatenating it into every request', () => {
    expect(requiredOrigin('X', 'https://relic.example/api/')).toBe(
      'https://relic.example'
    );
  });

  test('tolerates whitespace, which env files reliably introduce', () => {
    expect(requiredOrigin('X', '  https://relic.example  ')).toBe(
      'https://relic.example'
    );
  });

  // The point of having no default: an unset variable is a configuration
  // problem, and it should read as one at startup rather than as a DNS error
  // on the user's first publish.
  test('refuses an unset value and names the variable', () => {
    expect(() => requiredOrigin('RELIC_SERVICE_ORIGIN', undefined)).toThrow(
      /RELIC_SERVICE_ORIGIN is not set/
    );
  });

  test('refuses an empty or whitespace-only value', () => {
    expect(() => requiredOrigin('X', '')).toThrow(/is not set/);
    expect(() => requiredOrigin('X', '   ')).toThrow(/is not set/);
  });

  test('refuses something that is not a URL', () => {
    expect(() => requiredOrigin('X', 'relic.example')).toThrow(/is not a URL/);
  });

  // The plaintext is already encrypted by the time anything is sent, but the
  // grant that authorizes the upload is a bearer credential in flight.
  test('refuses plaintext http to a real host', () => {
    expect(() => requiredOrigin('X', 'http://relic.example')).toThrow(
      /must be https/
    );
  });

  test.each([
    ['http://localhost:7333', 'http://localhost:7333'],
    ['http://127.0.0.1:7333', 'http://127.0.0.1:7333'],
    ['http://[::1]:7333', 'http://[::1]:7333'],
  ])('allows http on loopback for development: %s', (input, expected) => {
    expect(requiredOrigin('X', input)).toBe(expected);
  });
});
