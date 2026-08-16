import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getUser, setUser, setToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser());
  const [mechanicProfile, setMechanicProfile] = useState(() => {
    const u = getUser();
    return u && u.mechanic_profile ? u.mechanic_profile : null;
  });
  const [loading, setLoading] = useState(true);

  const applyAuth = useCallback((res) => {
    setToken(res.token);
    setUser({ ...res.user, mechanic_profile: res.mechanic_profile || null });
    setUserState(res.user);
    setMechanicProfile(res.mechanic_profile || null);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const res = await api.me();
      applyAuth(res);
    } catch {
      logout();
    }
  }, [applyAuth]);

  useEffect(() => {
    const u = getUser();
    if (u && localStorage.getItem("acfix_token")) {
      refreshMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshMe]);

  const login = useCallback(
    async (payload) => {
      const res = await api.login(payload);
      applyAuth(res);
      return res;
    },
    [applyAuth]
  );

  const register = useCallback(
    async (payload) => {
      const res = await api.register(payload);
      applyAuth(res);
      return res;
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setUserState(null);
    setMechanicProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, mechanicProfile, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
