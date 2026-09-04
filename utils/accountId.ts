const ACCOUNT_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ACCOUNT_ID_LENGTH = 7;

/**
 * Builds the public "RM-XXXXXXX" account identifier from an internal user id.
 * Deterministic so the same account always shows the same id, including for
 * sessions created before account ids were stored.
 */
export function formatAccountId(seed: string): string {
  let hash = 7;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }

  let value = hash || 1;
  let code = '';

  for (let index = 0; index < ACCOUNT_ID_LENGTH; index += 1) {
    code += ACCOUNT_ID_ALPHABET[value % ACCOUNT_ID_ALPHABET.length];
    value = Math.floor(value / ACCOUNT_ID_ALPHABET.length) + (index + 1) * 17;
  }

  return `RM-${code}`;
}