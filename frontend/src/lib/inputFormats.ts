/** Frontend format rules aligned with backend DTO validation */

export const CONSTITUENCY_CODE_REGEX = /^NA-(100|[1-9]\d?)$/;
export const CONSTITUENCY_CODE_MESSAGE =
  'Constituency code must be NA-1 through NA-100 — for example NA-1 or NA-100.';

export const CITY_NAME_REGEX = /^[A-Z][a-z]+$/;
export const CITY_NAME_MESSAGE =
  'City name must be letters only with a capital first letter — for example Lahore (no spaces).';

export const PARTY_NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const PARTY_NAME_MESSAGE =
  'Party name must contain letters only with spaces between words — for example National Party.';
export const LEADER_NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const LEADER_NAME_MESSAGE =
  'Leader name must contain letters only with spaces between words, or leave the field blank.';

export const ELECTION_TITLE_REGEX = /^General Elections \d{4}$/;
export const ELECTION_TITLE_MESSAGE =
  'Use the format General Elections followed by a four-digit year — for example General Elections 2026.';

const NAME_LEN_MIN = 2;
const NAME_LEN_MAX = 100;

export function isValidPartyOrLeaderLength(value: string): boolean {
  return value.length >= NAME_LEN_MIN && value.length <= NAME_LEN_MAX;
}

export function validatePartyFields(nameTrimmed: string, leaderTrimmed: string): string | null {
  if (!nameTrimmed) {
    return 'Please enter a party name.';
  }
  if (!isValidPartyOrLeaderLength(nameTrimmed)) {
    return `Party name must be between ${NAME_LEN_MIN} and ${NAME_LEN_MAX} characters.`;
  }
  if (!PARTY_NAME_REGEX.test(nameTrimmed)) {
    return PARTY_NAME_MESSAGE;
  }
  if (leaderTrimmed) {
    if (!isValidPartyOrLeaderLength(leaderTrimmed)) {
      return `Leader name must be between ${NAME_LEN_MIN} and ${NAME_LEN_MAX} characters.`;
    }
    if (!LEADER_NAME_REGEX.test(leaderTrimmed)) {
      return LEADER_NAME_MESSAGE;
    }
  }
  return null;
}
