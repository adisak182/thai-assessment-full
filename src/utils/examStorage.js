export const examStorageKey = (userId, key) => `assessment:${userId}:${key}`;
export function clearExamStorage(userId, keys) {
  for (const key of keys) {
    sessionStorage.removeItem(examStorageKey(userId,key));
    sessionStorage.removeItem(examStorageKey(userId,key)+'_deadline');
  }
}
