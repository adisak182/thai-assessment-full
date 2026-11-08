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
    const error = new Error(result.message || 'ดึงข้อมูลโปรไฟล์ไม่สำเร็จ');
    error.status = response.status;
    throw error;
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

export const getAdminAllHistory = async (token) => {
  const response = await fetch(`${API_URL}/admin/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'ดึงประวัติการสอบทั้งหมดไม่สำเร็จ');
  return result;
};


export const getAdminSurveys = async (token) => {
  const response = await fetch(`${API_URL}/survey`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'ดึงข้อมูลแบบประเมินไม่สำเร็จ');
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

export const reviewAttempt = async (token, attemptId, questionId, correct) => {
  const response=await fetch(`${API_URL}/admin/attempts/${attemptId}/review`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({questionId,correct})});
  const result=await response.json();
  if(!response.ok)throw new Error(result.message || 'บันทึกผลตรวจไม่สำเร็จ');
  return result;
};

export async function uploadSpeakingAudio(token,id,blob,{questionId,skill,submissionId}) {
  const query=new URLSearchParams({questionId,skill,submissionId});
  const response=await fetch(`${API_URL}/users/speaking-audio/${id}?${query}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':blob.type||'audio/mp4'},body:blob,signal:AbortSignal.timeout(45000)});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.audioId)throw new Error(result?.message||(response.status===413?'ไฟล์เสียงใหญ่เกินไป กรุณาอัดให้สั้นลง':'ส่งเสียงไม่สำเร็จ เสียงยังอยู่ในหน้านี้ กรุณาลองอีกครั้ง'));
  return result;
}
export async function getSpeakingAudio(token,id) {
  const response=await fetch(`${API_URL}/users/speaking-audio/${id}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('โหลดเสียงคำตอบไม่ได้ กรุณาลองอีกครั้ง');
  return response.blob();
}
