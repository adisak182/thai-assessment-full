export const NAME_PREFIXES = ['นาย', 'นาง', 'นางสาว', 'ด.ช.', 'ด.ญ.'];

// Thai combining vowels/tone marks that mean the prefix letters belong to a syllable (e.g. "นายิกา").
const THAI_SYLLABLE_CONTINUATION = '[\u0e30-\u0e3a\u0e47-\u0e4e]';

const PREFIX_PATTERNS = [
  { prefix: 'นางสาว', regex: new RegExp(`^นางสาว(?!${THAI_SYLLABLE_CONTINUATION})\\s*`) },
  { prefix: 'นาย', regex: new RegExp(`^นาย(?!${THAI_SYLLABLE_CONTINUATION})\\s*`) },
  { prefix: 'นาง', regex: new RegExp(`^นาง(?!${THAI_SYLLABLE_CONTINUATION})\\s*`) },
  { prefix: 'ด.ช.', regex: /^(?:ด\.ช\.?|เด็กชาย)\s*/ },
  { prefix: 'ด.ญ.', regex: /^(?:ด\.ญ\.?|เด็กหญิง)\s*/ },
];

/**
 * Split a stored Thai full name into its known prefix and base name.
 */
export function splitNamePrefix(fullName = '') {
  const trimmed = String(fullName || '').trim();
  if (!trimmed) return { prefix: '', nameWithoutPrefix: '' };

  for (const { prefix, regex } of PREFIX_PATTERNS) {
    if (regex.test(trimmed)) {
      const rest = trimmed.replace(regex, '').trim();
      if (rest) {
        return { prefix, nameWithoutPrefix: rest };
      }
    }
  }
  return { prefix: '', nameWithoutPrefix: trimmed };
}

/**
 * Combine selected dropdown prefix and typed name without duplicating prefixes.
 */
export function combineNameWithPrefix(prefix = '', rawName = '') {
  const cleanPrefix = String(prefix || '').trim();
  const cleanName = String(rawName || '').trim();
  if (!cleanName) return '';
  if (!cleanPrefix) return cleanName;

  const { prefix: detected, nameWithoutPrefix } = splitNamePrefix(cleanName);
  const baseName = detected === cleanPrefix || /^(?:นาย|นาง|นางสาว|ด\.ช\.?|ด\.ญ\.?)\s+/.test(cleanName)
    ? nameWithoutPrefix
    : cleanName;
  return `${cleanPrefix}${baseName}`;
}
