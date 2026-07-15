import { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const profile = await api.getProfile(token);
          setUser(profile);
        } catch (err) {
          console.error("Session expired or invalid", err);
          localStorage.removeItem('jwt_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, [token]);

  const login = async ({ username, password }) => {
    const result = await api.loginUser({ username, password });
    localStorage.setItem('jwt_token', result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const register = async (data) => {
    const result = await api.registerUser(data);
    localStorage.setItem('jwt_token', result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const startSession = async (data) => {
    const result = await api.startSession(data);
    localStorage.setItem('jwt_token', result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
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

  const recordScore = async ({ level, skill, score, maxScore }) => {
    if (!token) return;
    const res = await api.saveScore(token, { level, skill, score, maxScore });
    const profile = await api.getProfile(token);
    setUser(profile);
    return res;
  };

  const submitSurvey = async (data) => {
    if (!token) return;
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
      apiError: null,
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
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
