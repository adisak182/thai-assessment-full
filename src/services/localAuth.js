// ==========================================
// Local Auth Service - ใช้ localStorage แทน MySQL
// รองรับผู้ใช้หลายคนในเครื่องเดียวกัน
// ==========================================

const USERS_KEY = 'thai_app_users';
const SESSION_KEY = 'thai_current_user_id';

// ดึงรายชื่อผู้ใช้ทั้งหมด
export function getAllUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAllUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ดึง User จาก ID
export function getUserById(id) {
  return getAllUsers().find(u => u.id === id) || null;
}

// ลงทะเบียนผู้ใช้ใหม่
export function registerUser({ username, password, name, age, gender, address, avatar }) {
  const users = getAllUsers();

  if (!username || !password || !name) {
    throw new Error('กรุณากรอกชื่อผู้ใช้ รหัสผ่าน และชื่อ-นามสกุล');
  }

  if (users.find(u => u.username === username)) {
    throw new Error('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อใหม่');
  }

  if (password.length < 4) {
    throw new Error('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
  }

  const newUser = {
    id: `user_${Date.now()}`,
    username,
    password, // localStorage ไม่มี hash แต่ใช้งานได้ในเครื่อง
    name,
    age: age || null,
    gender: gender || null,
    address: address || null,
    avatar: avatar || null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveAllUsers(users);

  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

// เข้าสู่ระบบ
export function loginUser({ username, password }) {
  if (!username || !password) {
    throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
  }

  const users = getAllUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  if (user.password !== password) {
    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  localStorage.setItem(SESSION_KEY, user.id);

  const { password: _, ...safeUser } = user;
  return safeUser;
}

// ออกจากระบบ
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

// ดึง User ที่ Login อยู่
export function getCurrentUser() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const user = getUserById(id);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

// อัปเดตโปรไฟล์
export function updateUserProfile(id, data) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('ไม่พบผู้ใช้');
  users[idx] = { ...users[idx], ...data };
  saveAllUsers(users);
  const { password: _, ...safeUser } = users[idx];
  return safeUser;
}

// ==================== SCORES ====================
function getScoreKey(userId, level, skill) {
  return `score_${userId}_l${level}_${skill}`;
}

function getHistoryKey(userId) {
  return `history_${userId}`;
}

export function saveScore(userId, { level, skill, score, maxScore }) {
  // Save latest score per skill
  localStorage.setItem(getScoreKey(userId, level, skill), JSON.stringify({ score, maxScore }));

  // Save to history
  const histKey = getHistoryKey(userId);
  const history = JSON.parse(localStorage.getItem(histKey) || '[]');
  history.unshift({
    level,
    skill,
    score,
    max_score: maxScore,
    taken_at: new Date().toISOString()
  });
  // Keep only latest 50
  localStorage.setItem(histKey, JSON.stringify(history.slice(0, 50)));

  // Compute level total and update passed status
  const skillsByLevel = {
    1: { listening: 15, conversation: 5, reading: 5, writing: 5 },
    2: { listening: 15, conversation: 5, reading: 10, writing: 10 },
    3: { listening: 15, conversation: 5, reading: 15, writing: 15 }
  };
  const passThresholds = { 1: 21, 2: 28, 3: 35 };
  const skills = Object.keys(skillsByLevel[level] || {});
  let total = 0;
  for (const s of skills) {
    const raw = localStorage.getItem(getScoreKey(userId, level, s));
    if (raw) total += JSON.parse(raw).score;
  }
  const passed = total >= (passThresholds[level] || 999);
  localStorage.setItem(`passed_${userId}_level${level}`, passed ? 'true' : 'false');

  return { total, passed };
}

export function getScores(userId) {
  const result = {};
  for (let level = 1; level <= 3; level++) {
    result[level] = {};
    for (const skill of ['listening', 'conversation', 'reading', 'writing']) {
      const raw = localStorage.getItem(getScoreKey(userId, level, skill));
      if (raw) result[level][skill] = JSON.parse(raw);
    }
  }
  return result;
}

export function getLevelPassed(userId, level) {
  const scores = getScores(userId)[level] || {};
  const passThresholds = { 1: 21, 2: 28, 3: 35 };
  
  let total = 0;
  for (const skill in scores) {
    total += scores[skill].score || 0;
  }
  
  return total >= (passThresholds[level] || 999);
}

export function getHistory(userId) {
  return JSON.parse(localStorage.getItem(getHistoryKey(userId)) || '[]');
}
