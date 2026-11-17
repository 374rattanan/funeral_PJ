import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  INITIAL_PACKAGES,
  INITIAL_SERVICES,
  INITIAL_LOCATIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_STAFF,
  INITIAL_BOOKINGS,
  RITUAL_TYPES,
  createDefaultAssignmentsForBooking
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  fetchAllDataFromSupabase,
  seedInitialBookingsToSupabaseIfEmpty,
  syncNewBookingToSupabase,
  syncApprovalAndPaymentToSupabase,
  syncCompleteEntireBookingToSupabase,
  syncTaskUpdateToSupabase,
  syncDepartmentTaskToSupabase,
  syncSavePackageToSupabase,
  syncDeletePackageFromSupabase,
  syncRecommendedPackageByBookingsToSupabase,
  syncSaveServiceAddonToSupabase,
  syncDeleteServiceAddonFromSupabase,
  syncSaveLocationToSupabase,
  syncDeleteLocationFromSupabase,
  syncAddDepartmentToSupabase,
  syncRemoveDepartmentFromSupabase,
  syncSaveStaffMemberToSupabase,
  syncDeleteStaffMemberFromSupabase
} from '../lib/supabaseSync';

const AppContext = createContext(null);

const STORAGE_KEY_STATE = 'banwiwek_app_state_v1';

// คำนวณจำนวนการจองของแต่ละแพ็กเกจ และกำหนด isRecommended ให้แพ็กเกจที่ลูกค้าเลือกเยอะที่สุดอัตโนมัติ
export const computePackagesWithPopularity = (packages = [], bookings = []) => {
  if (!Array.isArray(packages) || packages.length === 0) return [];

  // นับจำนวนใบจองของแต่ละแพ็กเกจ (ไม่นับงานที่ยกเลิก)
  const countMap = {};
  packages.forEach(pkg => {
    countMap[pkg.id] = 0;
  });

  (bookings || []).forEach(b => {
    if (!b || b.status === 'ยกเลิก') return;
    if (b.packageId && countMap[b.packageId] !== undefined) {
      countMap[b.packageId] += 1;
    } else if (b.packageName) {
      const matched = packages.find(p => p.name === b.packageName);
      if (matched) {
        countMap[matched.id] = (countMap[matched.id] || 0) + 1;
      }
    }
  });

  const maxBookings = Math.max(0, ...Object.values(countMap));

  // หากยังไม่มีการจองเลย ให้ใช้แพ็กเกจที่ตั้งค่าเริ่มต้นไว้ (หรือ PKG-03)
  if (maxBookings === 0) {
    const fallbackPkg = packages.find(p => p.isRecommended) || packages.find(p => p.id === 'PKG-03') || packages[0];
    return packages.map(pkg => ({
      ...pkg,
      bookingCount: 0,
      isRecommended: pkg.id === fallbackPkg?.id
    }));
  }

  // หาแพ็กเกจที่มียอดจองสูงสุด (กรณีเท่ากัน ให้สิทธิ์แพ็กเกจที่เคยเป็น isRecommended หรือเรียงตามลำดับ)
  const topCandidates = packages.filter(p => (countMap[p.id] || 0) === maxBookings);
  const winnerPkg = topCandidates.find(p => p.isRecommended) || topCandidates.find(p => p.id === 'PKG-03') || topCandidates[0];

  return packages.map(pkg => ({
    ...pkg,
    bookingCount: countMap[pkg.id] || 0,
    isRecommended: pkg.id === winnerPkg?.id
  }));
};

const buildInitialAssignments = (bookings) => {
  let all = [];
  bookings.forEach(b => {
    all = [...all, ...createDefaultAssignmentsForBooking(b)];
  });
  return all;
};

const buildInitialNotifications = () => [
  {
    id: 'NOTIF-01',
    type: 'NEW_REQUEST',
    bookingId: 'BW-00002',
    title: 'คำขอจัดงานใหม่ #BW-00002 (A002)',
    message: 'งานศพ นายสม ใจดี (แพ็กเกจเริ่มต้น) นัดชำระเงินที่ศูนย์บริการ 9 ส.ค. 2569',
    createdAt: '10 นาทีที่แล้ว',
    isRead: false
  },
  {
    id: 'NOTIF-02',
    type: 'TASK_UPDATE',
    bookingId: 'BW-00001',
    title: 'อัปเดตความคืบหน้าหน้างาน #BW-00001',
    message: 'ฝ่ายสถานที่ จัดเตรียมโต๊ะ เก้าอี้ เต็นท์ และแนบรูปหน้างานเรียบร้อยแล้ว',
    createdAt: '1 ชั่วโมงที่แล้ว',
    isRead: false
  }
];

export const AppProvider = ({ children }) => {
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    return {
      packages: INITIAL_PACKAGES,
      services: INITIAL_SERVICES,
      locations: INITIAL_LOCATIONS,
      departments: INITIAL_DEPARTMENTS,
      staff: INITIAL_STAFF,
      bookings: INITIAL_BOOKINGS,
      assignments: buildInitialAssignments(INITIAL_BOOKINGS),
      notifications: buildInitialNotifications()
    };
  };

  const [state, setState] = useState(loadInitialState);
  const [previewImageModal, setPreviewImageModal] = useState(null); // { title, url }
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // ดึงข้อมูลทั้งหมดจาก Supabase แบบ 100% Full Read/Write Integration
  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setIsLoadingDb(true);
    try {
      let dbData = await fetchAllDataFromSupabase();
      if (dbData) {
        setSupabaseConnected(true);
        // ถ้าในตาราง funerals ยังไม่มีใบจองเลย ให้ซิงก์ใบจองเริ่มต้นลงฐานข้อมูลให้อัตโนมัติ
        if (!dbData.hasBookingsInDb) {
          await seedInitialBookingsToSupabaseIfEmpty(INITIAL_BOOKINGS, buildInitialAssignments);
          dbData = await fetchAllDataFromSupabase() || dbData;
        }

        setState(prev => ({
          ...prev,
          departments: dbData.departments?.length > 0 ? dbData.departments : prev.departments,
          staff: dbData.staff?.length > 0 ? dbData.staff : prev.staff,
          locations: dbData.locations?.length > 0 ? dbData.locations : prev.locations,
          packages: dbData.packages?.length > 0 ? dbData.packages : prev.packages,
          services: dbData.services?.length > 0 ? dbData.services : prev.services,
          bookings: dbData.bookings?.length > 0 ? dbData.bookings : prev.bookings,
          assignments: dbData.assignments?.length > 0 ? dbData.assignments : prev.assignments
        }));
        console.log('✅ ซิงก์ข้อมูลจาก Supabase ครบ 100% สำเร็จ!');
      }
    } catch (err) {
      console.warn('⚠️ เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Supabase:', err);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage (quota or error):', e);
    }
  }, [state]);

  // รีเซ็ตข้อมูลเริ่มต้น (Reset Demo Data)
  const resetDemoData = async () => {
    const fresh = {
      packages: INITIAL_PACKAGES,
      services: INITIAL_SERVICES,
      locations: INITIAL_LOCATIONS,
      departments: INITIAL_DEPARTMENTS,
      staff: INITIAL_STAFF,
      bookings: INITIAL_BOOKINGS,
      assignments: buildInitialAssignments(INITIAL_BOOKINGS),
      notifications: buildInitialNotifications()
    };
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(fresh));
    setState(fresh);
    if (isSupabaseConfigured) {
      await refreshFromSupabase();
    }
  };

  // สร้างคำขอจัดงานใหม่จากหน้า 4-Step Booking ของลูกค้า
  const createBookingRequest = (bookingPayload) => {
    const nextIdx = state.bookings.length + 1;
    const padded = String(nextIdx).padStart(5, '0');
    const shortCode = `A${String(nextIdx).padStart(3, '0')}`;
    const newId = `BW-${padded}`;

    const newBooking = {
      ...bookingPayload,
      id: newId,
      reqNumber: newId,
      code: shortCode,
      createdAt: new Date().toISOString(),
      status: 'รออนุมัติ',
      installment1Paid: false,
      installment1PaidAt: null,
      installment1Slip: null,
      installment2Paid: false,
      installment2PaidAt: null,
      installment2Slip: null
    };

    const newTasks = createDefaultAssignmentsForBooking(newBooking);

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'NEW_REQUEST',
      bookingId: newId,
      title: `คำขอจัดงานใหม่ #${newId} (${shortCode})`,
      message: `งานศพ ${newBooking.deceased.prefix}${newBooking.deceased.fullName} (${newBooking.packageName}) นัดหมาย ${newBooking.appointmentDate}`,
      createdAt: 'เมื่อสักครู่',
      isRead: false
    };

    const nextBookings = [newBooking, ...state.bookings];
    setState(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      assignments: [...newTasks, ...prev.assignments],
      notifications: [newNotif, ...prev.notifications]
    }));

    // บันทึกคำขอจัดงานใหม่ลงตารางทั้งหมดใน Supabase และอัปเดตแพ็กเกจแนะนำตามยอดจองสูงสุด
    syncNewBookingToSupabase(newBooking, newTasks);
    const updatedPkgs = computePackagesWithPopularity(state.packages, nextBookings);
    const recommendedPkg = updatedPkgs.find(p => p.isRecommended);
    if (recommendedPkg) {
      syncRecommendedPackageByBookingsToSupabase(recommendedPkg.id, updatedPkgs);
    }

    return newBooking;
  };

  // แอดมินอัปเดตเปอร์เซ็นต์งวดแรก และ/หรือ แนบสลิปงวดที่ 1 หรือ งวดที่ 2
  const updateBookingPayment = (bookingId, paymentUpdates) => {
    setState(prev => {
      let updatedBooking = null;
      const bookings = prev.bookings.map(b => {
        if (b.id !== bookingId) return b;
        updatedBooking = { ...b, ...paymentUpdates };
        return updatedBooking;
      });
      if (updatedBooking) {
        syncApprovalAndPaymentToSupabase(updatedBooking);
      }
      return { ...prev, bookings };
    });
  };

  // แอดมินกดอนุมัติคำขอจัดงาน (ต้องแนบสลิปงวดแรกหรือจ่ายเต็มจำนวนแล้ว)
  const approveBookingRequest = (bookingId) => {
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';

    setState(prev => {
      let approvedBooking = null;
      const bookings = prev.bookings.map(b => {
        if (b.id !== bookingId) return b;
        approvedBooking = {
          ...b,
          status: 'กำลังดำเนินงาน',
          approvedAt: nowText
        };
        return approvedBooking;
      });
      if (approvedBooking) {
        syncApprovalAndPaymentToSupabase(approvedBooking);
      }
      return {
        ...prev,
        bookings,
        assignments: prev.assignments.map(t => {
          if (t.bookingId !== bookingId) return t;
          return {
            ...t,
            status: t.status === 'ยังไม่ได้มอบหมาย' ? 'มอบหมายแล้ว' : t.status
          };
        }),
        notifications: prev.notifications.map(n =>
          n.bookingId === bookingId ? { ...n, isRead: true } : n
        )
      };
    });
  };

  // แอดมินปิดงานเป็นเสร็จสิ้นบริบูรณ์ (เมื่อทุกแผนกเสร็จและชำระครบแล้ว)
  const completeEntireBooking = (bookingId) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'เสร็จสิ้น' } : b
      )
    }));
    syncCompleteEntireBookingToSupabase(bookingId);
  };

  // แอดมินมอบหมายงานแต่ละส่วนให้แผนกและเจ้าหน้าที่
  const assignTaskToStaff = (taskId, { department, staffId, staffName, staffPhone, note }) => {
    setState(prev => {
      let updatedTask = null;
      const assignments = prev.assignments.map(t => {
        if (t.id !== taskId) return t;
        updatedTask = {
          ...t,
          department: department ?? t.department,
          staffId: staffId ?? t.staffId,
          staffName: staffName ?? t.staffName,
          staffPhone: staffPhone ?? t.staffPhone,
          note: note !== undefined ? note : t.note,
          status: t.status === 'ยังไม่ได้มอบหมาย' ? 'มอบหมายแล้ว' : t.status
        };
        return updatedTask;
      });
      if (updatedTask) {
        syncTaskUpdateToSupabase(updatedTask);
      }
      return { ...prev, assignments };
    });
  };

  // แผนกปฏิบัติงานกดรับงาน (มอบหมายแล้ว -> กำลังดำเนินงาน)
  const acceptDepartmentTask = (taskId) => {
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    setState(prev => {
      let updatedTask = null;
      const assignments = prev.assignments.map(t => {
        if (t.id !== taskId) return t;
        updatedTask = {
          ...t,
          status: 'กำลังดำเนินงาน',
          currentStep: 2,
          acceptedAt: timeStr
        };
        return updatedTask;
      });
      if (updatedTask) {
        syncTaskUpdateToSupabase(updatedTask);
      }
      return { ...prev, assignments };
    });
  };

  // แผนกปฏิบัติงานติ๊กเช็กลิสต์ย่อย
  const toggleTaskChecklist = (taskId, checklistId) => {
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    setState(prev => {
      let updatedTask = null;
      const assignments = prev.assignments.map(t => {
        if (t.id !== taskId) return t;
        const updatedList = t.checklist.map(item => {
          if (item.id !== checklistId) return item;
          const nextChecked = !item.isChecked;
          return {
            ...item,
            isChecked: nextChecked,
            completedTime: nextChecked ? timeStr : ''
          };
        });
        const allChecked = updatedList.every(i => i.isChecked);
        updatedTask = {
          ...t,
          status: t.status === 'ยังไม่ได้มอบหมาย' || t.status === 'มอบหมายแล้ว' ? 'กำลังดำเนินงาน' : t.status,
          currentStep: allChecked ? 3 : 2,
          checklist: updatedList
        };
        return updatedTask;
      });
      if (updatedTask) {
        syncTaskUpdateToSupabase(updatedTask);
      }
      return { ...prev, assignments };
    });
  };

  // แผนกปฏิบัติงานอัปโหลดรูปหน้างาน & หมายเหตุ
  const updateTaskPhotosAndNote = (taskId, { photos, fieldNote }) => {
    setState(prev => {
      let updatedTask = null;
      const assignments = prev.assignments.map(t => {
        if (t.id !== taskId) return t;
        updatedTask = {
          ...t,
          photos: photos !== undefined ? photos : t.photos,
          fieldNote: fieldNote !== undefined ? fieldNote : t.fieldNote,
          status: t.status === 'มอบหมายแล้ว' ? 'กำลังดำเนินงาน' : t.status
        };
        return updatedTask;
      });
      if (updatedTask) {
        syncTaskUpdateToSupabase(updatedTask);
      }
      return { ...prev, assignments };
    });
  };

  // แผนกปฏิบัติงานกดยืนยันการเสร็จสิ้น (ต้องเช็กลิสต์ครบ 100% + มีรูป >= 1 รูป)
  const completeDepartmentTask = (taskId) => {
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';

    let completedTask = null;
    setState(prev => {
      const updatedAssignments = prev.assignments.map(t => {
        if (t.id !== taskId) return t;
        completedTask = {
          ...t,
          status: 'เสร็จสิ้น',
          currentStep: 4,
          completedAt: nowText
        };
        return completedTask;
      });

      const newNotif = completedTask ? {
        id: `NOTIF-${Date.now()}`,
        type: 'TASK_DONE',
        bookingId: completedTask.bookingId,
        title: `${completedTask.department} ส่งมอบงานเสร็จสิ้น`,
        message: `งาน "${completedTask.title}" (รหัส #${completedTask.bookingId}) ทำเช็กลิสต์ครบ 100% และแนบรูปหน้างานแล้ว`,
        createdAt: 'เมื่อสักครู่',
        isRead: false
      } : null;

      if (completedTask) {
        syncDepartmentTaskToSupabase(completedTask);
      }

      return {
        ...prev,
        assignments: updatedAssignments,
        notifications: newNotif ? [newNotif, ...prev.notifications] : prev.notifications
      };
    });
  };

  // การจัดการแพ็กเกจหลัก (Admin CRUD -> ซิงก์ลงตาราง packages)
  const savePackage = (pkgData) => {
    setState(prev => {
      const exists = prev.packages.some(p => p.id === pkgData.id);
      const savedPkg = exists
        ? pkgData
        : { ...pkgData, id: `PKG-0${prev.packages.length + 1}` };
      const packages = exists
        ? prev.packages.map(p => (p.id === pkgData.id ? savedPkg : p))
        : [...prev.packages, savedPkg];
      syncSavePackageToSupabase(savedPkg);
      return { ...prev, packages };
    });
  };

  const deletePackage = (pkgId) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.filter(p => p.id !== pkgId)
    }));
    syncDeletePackageFromSupabase(pkgId);
  };

  // การจัดการบริการเสริม Add-ons (Admin CRUD -> ซิงก์ลงตาราง items)
  const saveServiceAddon = (serviceData) => {
    setState(prev => {
      const exists = prev.services.some(s => s.id === serviceData.id);
      const savedSrv = exists
        ? serviceData
        : { ...serviceData, id: `SRV-${Date.now().toString().slice(-4)}` };
      const services = exists
        ? prev.services.map(s => (s.id === serviceData.id ? savedSrv : s))
        : [...prev.services, savedSrv];
      syncSaveServiceAddonToSupabase(savedSrv);
      return { ...prev, services };
    });
  };

  const deleteServiceAddon = (serviceId) => {
    setState(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
    syncDeleteServiceAddonFromSupabase(serviceId);
  };

  // การจัดการสถานที่/วัด/ศาลา (Admin CRUD -> ซิงก์ลงตาราง temples, temple_images, pavilions)
  const saveLocation = (locData) => {
    setState(prev => {
      const exists = prev.locations.some(l => l.id === locData.id);
      const savedLoc = exists
        ? locData
        : { ...locData, id: `LOC-0${prev.locations.length + 1}` };
      const locations = exists
        ? prev.locations.map(l => (l.id === locData.id ? savedLoc : l))
        : [...prev.locations, savedLoc];
      syncSaveLocationToSupabase(savedLoc);
      return { ...prev, locations };
    });
  };

  const deleteLocation = (locId) => {
    setState(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l.id !== locId)
    }));
    syncDeleteLocationFromSupabase(locId);
  };

  // การจัดการแผนกและบุคลากร (Admin CRUD -> ซิงก์ลงตาราง departments & community_workers)
  const addDepartmentTag = (deptName) => {
    if (!deptName.trim()) return;
    const clean = deptName.trim();
    setState(prev => {
      if (prev.departments.includes(clean)) return prev;
      syncAddDepartmentToSupabase(clean);
      return { ...prev, departments: [...prev.departments, clean] };
    });
  };

  const removeDepartmentTag = (deptName) => {
    setState(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== deptName)
    }));
    syncRemoveDepartmentFromSupabase(deptName);
  };

  const saveStaffMember = (staffData) => {
    setState(prev => {
      const exists = prev.staff.some(s => s.id === staffData.id);
      const savedStaff = exists
        ? staffData
        : { ...staffData, id: `STF-0${prev.staff.length + 1}` };
      const staff = exists
        ? prev.staff.map(s => (s.id === staffData.id ? savedStaff : s))
        : [...prev.staff, savedStaff];
      syncSaveStaffMemberToSupabase(savedStaff);
      return { ...prev, staff };
    });
  };

  const deleteStaffMember = (staffId) => {
    setState(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== staffId)
    }));
    syncDeleteStaffMemberFromSupabase(staffId);
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
    }));
  };

  // คำนวณแพ็กเกจแนะนำและจำนวนครั้งที่ลูกค้าเลือกจากข้อมูลใบจองจริงแบบ Real-time
  const packagesWithPopularity = useMemo(
    () => computePackagesWithPopularity(state.packages, state.bookings),
    [state.packages, state.bookings]
  );

  return (
    <AppContext.Provider value={{
      ...state,
      packages: packagesWithPopularity,
      ritualTypes: RITUAL_TYPES,
      resetDemoData,
      refreshFromSupabase,
      createBookingRequest,
      updateBookingPayment,
      approveBookingRequest,
      completeEntireBooking,
      assignTaskToStaff,
      acceptDepartmentTask,
      toggleTaskChecklist,
      updateTaskPhotosAndNote,
      completeDepartmentTask,
      savePackage,
      deletePackage,
      saveServiceAddon,
      deleteServiceAddon,
      saveLocation,
      deleteLocation,
      addDepartmentTag,
      removeDepartmentTag,
      saveStaffMember,
      deleteStaffMember,
      markAllNotificationsRead,
      previewImageModal,
      setPreviewImageModal,
      supabaseConnected,
      isSupabaseConfigured,
      isLoadingDb
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

// Helper แปลงไฟล์เป็น Base64 Data URL
export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
