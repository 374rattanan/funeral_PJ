import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DEPARTMENTS } from '../data/initialData';

const AuthContext = createContext(null);

const STORAGE_KEY_AUTH = 'banwiwek_auth_v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch (e) {
      console.error('Failed to save auth state:', e);
    }
  }, [user]);

  const loginAsAdmin = (username = 'admin') => {
    const adminUser = {
      id: 'USR-ADMIN',
      username,
      displayName: 'ผู้ดูแลระบบ (Admin)',
      role: 'admin',
      department: null
    };
    setUser(adminUser);
    return adminUser;
  };

  const loginAsDepartment = (departmentName = INITIAL_DEPARTMENTS[0], staffName = 'เจ้าหน้าที่ประจำฝ่าย') => {
    const deptUser = {
      id: `USR-DEPT-${departmentName}`,
      username: departmentName,
      displayName: staffName,
      role: 'department',
      department: departmentName
    };
    setUser(deptUser);
    return deptUser;
  };

  const switchDepartment = (departmentName) => {
    setUser(prev => ({
      ...(prev || { id: 'USR-DEPT', role: 'department' }),
      role: 'department',
      department: departmentName,
      displayName: departmentName
    }));
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginAsAdmin,
      loginAsDepartment,
      switchDepartment,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
