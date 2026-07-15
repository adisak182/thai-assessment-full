// api.js
const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export const registerUser = async (data) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'การสมัครสมาชิกผิดพลาด');
  }
  return result; // { message, token, user }
};

export const startSession = async (data) => {
  const response = await fetch(`${API_URL}/auth/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'เริ่มต้นใช้งานไม่สำเร็จ');
  }
  return result; // { message, token, user }
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
  }
  return result; // { message, token, user }
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'ดึงข้อมูลโปรไฟล์ไม่สำเร็จ');
  }
  return result;
};

export const updateUserProfile = async (token, data) => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'อัปเดตข้อมูลไม่สำเร็จ');
  }
  return result;
};

export const saveScore = async (token, data) => {
  const response = await fetch(`${API_URL}/users/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'บันทึกคะแนนไม่สำเร็จ');
  }
  return result;
};

export const saveSurvey = async (token, data) => {
  const response = await fetch(`${API_URL}/survey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'บันทึกแบบประเมินไม่สำเร็จ');
  }
  return result;
};

export const getHistory = async (token) => {
  const response = await fetch(`${API_URL}/users/history`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'ดึงประวัติคะแนนไม่สำเร็จ');
  }
  return result;
};

export const getScores = async (token) => {
  const response = await fetch(`${API_URL}/users/scores`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'ดึงข้อมูลคะแนนไม่สำเร็จ');
  }
  return result;
};

export const getRanking = async (token) => {
  const response = await fetch(`${API_URL}/users/ranking`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'ดึงข้อมูลอันดับไม่สำเร็จ');
  }
  return result;
};

// ==================== ADMIN ROUTES ====================

export const getAdminUsers = async (token) => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'ดึงข้อมูลผู้ใช้ไม่สำเร็จ');
  return result;
};

export const getAdminUserScores = async (token, userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/scores`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'ดึงข้อมูลคะแนนไม่สำเร็จ');
  return result;
};

export const deleteUser = async (token, userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'ลบผู้ใช้ไม่สำเร็จ');
  return result;
};

export const updateUserByAdmin = async (token, userId, data) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'อัปเดตข้อมูลผู้ใช้ไม่สำเร็จ');
  return result;
};
