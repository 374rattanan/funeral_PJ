import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DEPARTMENTS } from '../data/initialData';
import { authenticateUserFromSupabase } from '../lib/supabaseSync';
import { IS_DEMO_MODE, normalizeDepartmentName } from '../config/siteConfig';

const AuthContext = createContext(null);

const STORAGE_KEY_AUTH = 'banwiwek_auth_v1';

// บัญชีสำรองเฉพาะโหมดเดโมหรือกรณีออฟไลน์ (ตรงกับตาราง users_auth ในฐานข้อมูล)
const FALLBACK_ACCOUNTS = [
  { username: 'admin', password: 'admin1234', altPassword: '123456', role: 'admin', displayName: 'ผู้ดูแลระบบ วิสาหกิจชุมชนบ้านวิเวก', department: null },
  { username: 'venue_dept', password: 'dept1234', role: 'department', displayName: 'ป้าฝ้าย ใจดี (ฝ่ายสถานที่)', department: 'ฝ่ายสถานที่' },
  { username: 'craft_dept', password: 'dept1234', role: 'department', displayName: 'ป้าไหม สุขใจ (ฝ่ายหัตถกรรมและของชำร่วย)', department: 'ฝ่ายหัตถกรรมและของชำร่วย' },
  { username: 'food_dept', password: 'dept1234', role: 'department', displayName: 'ป้านุ่น อิ่มบุญ (ฝ่ายอาหารและเครื่องดื่ม)', department: 'ฝ่ายอาหารและเครื่องดื่ม' },
  { username: 'ritual_dept', password: 'dept1234', role: 'department', displayName: 'ป้าหวาย มงคล (ฝ่ายพิธีการและศาสนา)', department: 'ฝ่ายพิธีการและศาสนา' },
  { username: 'flower_dept', password: 'dept1234', role: 'department', displayName: 'ลุงคำ งามตา (ฝ่ายดอกไม้และตกแต่ง)', department: 'ฝ่ายดอกไม้และตกแต่ง' },
  { username: 'audio_dept', password: 'dept1234', role: 'department', displayName: 'ช่างเอก เสียงใส (ฝ่ายเครื่องเสียงและไฟฟ้า)', department: 'ฝ่ายเครื่องเสียงและไฟฟ้า' },
  { username: 'vehicle_dept', password: 'dept1234', role: 'department', displayName: 'ลุงมี เดินทาง (ฝ่ายยานพาหนะ)', department: 'ฝ่ายยานพาหนะ' },
  { username: 'coffin_dept', password: 'dept1234', role: 'department', displayName: 'ลุงแก้ว บุญเรือง (ฝ่ายหีบศพและอุปกรณ์)', department: 'ฝ่ายหีบศพและอุปกรณ์' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.department) {
        parsed.department = normalizeDepartmentName(parsed.department);
      }
      return parsed;
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

  // ล็อกอินจริงกับตาราง users_auth บน Supabase (รองรับรหัสผ่าน 123456 เพิ่มเติมเฉพาะโหมดเดโม)
  const loginWithCredentials = async (username, password, expectedRole = null) => {
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();
    if (!cleanUser || !cleanPass) {
      return { ok: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน' };
    }

    const dbRes = await authenticateUserFromSupabase(cleanUser, cleanPass);
    if (dbRes.ok && dbRes.user) {
      if (expectedRole && dbRes.user.role !== expectedRole) {
        return {
          ok: false,
          message: expectedRole === 'admin'
            ? 'บัญชีนี้ไม่ใช่บัญชีผู้ดูแลระบบ (Admin)'
            : 'บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่แผนกปฏิบัติงาน'
        };
      }
      setUser(dbRes.user);
      return { ok: true, user: dbRes.user };
    }

    // ในโหมดเดโม (หรือเมื่อ Supabase ออฟไลน์) อนุญาตบัญชีทดสอบที่กำหนดไว้
    if (IS_DEMO_MODE || dbRes.offline) {
      const matched = FALLBACK_ACCOUNTS.find(
        acc =>
          acc.username === cleanUser &&
          (acc.password === cleanPass || (IS_DEMO_MODE && acc.altPassword && acc.altPassword === cleanPass))
      );
      if (matched) {
        if (expectedRole && matched.role !== expectedRole) {
          return {
            ok: false,
            message: expectedRole === 'admin'
              ? 'บัญชีนี้ไม่ใช่บัญชีผู้ดูแลระบบ (Admin)'
              : 'บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่แผนกปฏิบัติงาน'
          };
        }
        const loggedUser = {
          id: `USR-${matched.username}`,
          username: matched.username,
          displayName: matched.displayName,
          role: matched.role,
          department: matched.department
        };
        setUser(loggedUser);
        return { ok: true, user: loggedUser };
      }
    }

    return { ok: false, message: dbRes.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  };

  const loginAsAdmin = (username = 'admin') => {
    const adminUser = {
      id: 'USR-ADMIN',
      username,
      displayName: 'ผู้ดูแลระบบ วิสาหกิจชุมชนบ้านวิเวก',
      role: 'admin',
      department: null
    };
    setUser(adminUser);
    return adminUser;
  };

  const loginAsDepartment = (departmentName = INITIAL_DEPARTMENTS[0], staffName = 'เจ้าหน้าที่ประจำฝ่าย') => {
    const normalizedDept = normalizeDepartmentName(departmentName);
    const deptUser = {
      id: `USR-DEPT-${normalizedDept}`,
      username: normalizedDept,
      displayName: staffName,
      role: 'department',
      department: normalizedDept
    };
    setUser(deptUser);
    return deptUser;
  };

  const switchDepartment = (departmentName) => {
    const normalizedDept = normalizeDepartmentName(departmentName);
    setUser(prev => ({
      ...(prev || { id: 'USR-DEPT', role: 'department' }),
      role: 'department',
      department: normalizedDept,
      displayName: normalizedDept
    }));
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginWithCredentials,
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
