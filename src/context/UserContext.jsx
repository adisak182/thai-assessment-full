import { createContext, useState, useContext, useEffect, Fragment } from 'react';
import * as api from '../services/api';

const UserContext = createContext();

const getSafeStoredToken = () => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('jwt_token') : null;
  } catch {
    return null;
  }
};

const setSafeStoredToken = (val) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (val) window.localStorage.setItem('jwt_token', val);
      else window.localStorage.removeItem('jwt_token');
    }
  } catch {
    // Ignore storage restrictions
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getSafeStoredToken());
  const [loading, setLoading] = useState(true);

  const [apiError,setApiError]=useState(null);
  const [retryCount,setRetryCount]=useState(0);

  // Initial load
  useEffect(() => {
    let cancelled=false;
    const init=async()=>{
      setLoading(true);
      try{
        if(token){
          const profile=await api.getProfile(token);
          if(!cancelled){setUser(profile);setApiError(null);}
        }
      }catch(error){
        if(cancelled)return;
        if(error.status===401 || error.status===404){
          setSafeStoredToken(null);setToken(null);setUser(null);
        }else setApiError('offline');
      }finally{if(!cancelled)setLoading(false);}
    };
    init();
    return ()=>{cancelled=true;};
  },[token,retryCount]);

  const login = async ({ username, password }) => {
    const result = await api.loginUser({ username, password });
    setSafeStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const register = async (data) => {
    const result = await api.registerUser(data);
    setSafeStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const startSession = async (data) => {
    const result = await api.startSession(data);
    setSafeStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    setSafeStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data) => {
    if (!token) return;
    await api.updateUserProfile(token, data);
    const profile = await api.getProfile(token);
    setUser(profile);
    return profile;
  };

  const recordScore = async (data) => {
    if(!token)throw new Error('กรุณาเข้าสู่ระบบก่อน');
    return api.saveScore(token,data);
  };

  const submitSurvey = async (data) => {
    if (!token) throw new Error('กรุณาเข้าสู่ระบบก่อน');
    return await api.saveSurvey(token, data);
  };

  const fetchHistory = async () => {
    if (!token) return [];
    return await api.getHistory(token);
  };

  const checkLevelPassed = (level) => {
    if (!user || !user.progress) return false;
    return user.progress[`level${level}_passed`] === 1;
  };

  const updateScore = () => {};

  const fetchScores = async () => {
    if (!token) return {};
    const data = await api.getScores(token);
    // Convert array format to localAuth format: { 1: { listening: { score: 10 } } }
    const result = { 1: {}, 2: {}, 3: {} };
    if (data.scores) {
      data.scores.forEach(row => {
        if (!result[row.level]) result[row.level] = {};
        result[row.level][row.skill] = { score: row.score, max_score: row.max_score };
      });
    }
    return result;
  };

  const fetchRanking = async () => {
    if (!token) return [];
    return await api.getRanking(token);
  };

  return (
    <UserContext.Provider value={{
      user,
      token,
      loading,
      apiError,
      login,
      register,
      startSession,
      logout,
      updateUser,
      recordScore,
      fetchHistory,
      fetchScores,
      fetchRanking,
      checkLevelPassed,
      updateScore,
      submitSurvey
    }}>
      {!loading && (token && !user && apiError ? (
        <div role="alert" style={{padding:32,textAlign:'center'}}>
          <p>เชื่อมต่อระบบไม่ได้ชั่วคราว ข้อมูลเข้าสู่ระบบยังอยู่</p>
          <button onClick={()=>setRetryCount(n=>n+1)}>ลองเชื่อมต่อใหม่</button>
        </div>
      ) : <Fragment key={user?.id || user?._id || 'anonymous'}>{children}</Fragment>)}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
