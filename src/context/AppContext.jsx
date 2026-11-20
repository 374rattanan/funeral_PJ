import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  syncCancelBookingToSupabase,
  syncUpdateBookingDetailsToSupabase,
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

import {
  normalizeDepartmentName
} from '../config/siteConfig';

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

const enrichTaskWithBooking = (t, b) => {
  const venueDisplay = t.locationDisplay || t.locationName || (b ? `${b.locationName} (${b.pavilionName})` : 'วัดวิเวกวนาราม (ศาลา 1)');
  const dateRange = b?.startDate
    ? `${b.startDate}${b.cremationDate && b.cremationDate !== b.startDate ? ` ถึง ${b.cremationDate}` : ''}`
    : (t.workDate || '');
  return {
    ...t,
    department: normalizeDepartmentName(t.department),
    bookingCode: t.bookingCode || b?.code || t.bookingId,
    bookingStatus: b?.status || t.bookingStatus || 'รออนุมัติ',
    deceasedName: t.deceasedName || (b ? `${b.deceased?.prefix || ''}${b.deceased?.fullName || ''}`.trim() : 'ผู้วายชนม์'),
    hostName: t.hostName || (b ? `${b.contact?.prefix || ''}${b.contact?.fullName || ''}`.trim() : 'เจ้าภาพ'),
    hostPhone: t.hostPhone || b?.contact?.phone || '',
    locationName: venueDisplay,
    locationDisplay: venueDisplay,
    dateRangeText: t.dateRangeText || dateRange
  };
};

const buildInitialAssignments = (bookings) => {
  let all = [];
  bookings.forEach(b => {
    const created = createDefaultAssignmentsForBooking(b).map(t => enrichTaskWithBooking(t, b));
    all = [...all, ...created];
  });
  return all;
};

const buildNotificationsFromBookings = (bookings = []) => {
  return (bookings || [])
    .filter(b => b.status === 'รออนุมัติ')
    .slice(0, 5)
    .map(b => ({
      id: `NOTIF-PENDING-${b.id}`,
      type: 'NEW_REQUEST',
      bookingId: b.id,
      title: `คำขอจัดงานรออนุมัติ #${b.id} (${b.code || ''})`,
      message: `งานศพ ${b.deceased?.prefix || ''}${b.deceased?.fullName || ''} (${b.packageName}) นัดหมาย ${b.appointmentDate || b.startDate || '-'}`,
      createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString('th-TH') : 'ล่าสุด',
      isRead: false
    }));
};

export const AppProvider = ({ children }) => {
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.assignments) && Array.isArray(parsed.bookings)) {
          parsed.assignments = parsed.assignments.map(t => {
            const b = parsed.bookings.find(bk => bk.id === t.bookingId);
            return enrichTaskWithBooking(t, b);
          });
        }
        if (parsed && Array.isArray(parsed.departments)) {
          parsed.departments = [...new Set(parsed.departments.map(normalizeDepartmentName))];
        }
        if (parsed && Array.isArray(parsed.staff)) {
          parsed.staff = parsed.staff.map(s => ({ ...s, department: normalizeDepartmentName(s.department) }));
        }
        if (parsed && Array.isArray(parsed.packages)) {
          parsed.packages = parsed.packages.map(p => ({
            ...p,
            coverImage: (!p.coverImage || p.coverImage.includes('images.unsplash.com'))
              ? '/images/package-cover.jpg'
              : p.coverImage
          }));
        }
        return parsed;
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
      notifications: buildNotificationsFromBookings(INITIAL_BOOKINGS)
    };
  };

  const [state, setState] = useState(loadInitialState);
  const [previewImageModal, setPreviewImageModal] = useState(null); // { title, url }
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const pendingWritesRef = useRef(0);
  const noteTimersRef = useRef({});
  const stateRef = useRef(state);
  stateRef.current = state;

  const trackWrite = useCallback(async (promise) => {
    pendingWritesRef.current += 1;
    try {
      return await promise;
    } finally {
      pendingWritesRef.current = Math.max(0, pendingWritesRef.current - 1);
    }
  }, []);

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

        setState(prev => {
          const nextBookings = dbData.bookings?.length > 0 ? dbData.bookings : prev.bookings;
          // สร้างแจ้งเตือนสำหรับใบจองรออนุมัติที่ยังไม่อยู่ในรายการแจ้งเตือน
          const existingIds = new Set((prev.notifications || []).map(n => n.bookingId));
          const realPendingNotifs = buildNotificationsFromBookings(nextBookings).filter(
            n => !existingIds.has(n.bookingId)
          );
          const cleanedPrevNotifs = (prev.notifications || []).filter(
            n => !String(n.id || '').startsWith('NOTIF-0')
          );

          return {
            ...prev,
            departments: dbData.departments?.length > 0 ? dbData.departments : prev.departments,
            staff: dbData.staff?.length > 0 ? dbData.staff : prev.staff,
            locations: dbData.locations?.length > 0 ? dbData.locations : prev.locations,
            packages: dbData.packages?.length > 0 ? dbData.packages : prev.packages,
            services: dbData.services?.length > 0 ? dbData.services : prev.services,
            bookings: nextBookings,
            assignments: dbData.assignments?.length > 0 ? dbData.assignments : prev.assignments,
            notifications: [...realPendingNotifs, ...cleanedPrevNotifs].slice(0, 30)
          };
        });
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

  // เชื่อมต่อ Supabase Realtime (postgres_changes) เพื่ออัปเดตข้อมูลแบบเรียลไทม์ทันทีที่ฐานข้อมูลมีการเปลี่ยนแปลง
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let debounceTimer = null;
    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (pendingWritesRef.current === 0) {
          refreshFromSupabase();
        }
      }, 450);
    };

    const channel = supabase
      .channel('banwiwek-realtime-db-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        scheduleRefresh();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ เชื่อมต่อ Supabase Realtime สำเร็จ!');
        }
      });

    const handleWindowFocus = () => {
      if (pendingWritesRef.current === 0) {
        refreshFromSupabase();
      }
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('focus', handleWindowFocus);
      supabase.removeChannel(channel);
    };
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
      notifications: buildNotificationsFromBookings(INITIAL_BOOKINGS)
    };
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(fresh));
    setState(fresh);
    if (isSupabaseConfigured) {
      await refreshFromSupabase();
    }
  };

  // สร้างคำขอจัดงานใหม่จากหน้า 4-Step Booking ของลูกค้า
  const createBookingRequest = (bookingPayload) => {
    const curState = stateRef.current;
    const maxNum = curState.bookings.reduce((max, b) => {
      const idNum = parseInt(String(b.id || '').replace(/\D/g, ''), 10);
      const codeNum = parseInt(String(b.code || '').replace(/\D/g, ''), 10);
      const highest = Math.max(Number.isFinite(idNum) ? idNum : 0, Number.isFinite(codeNum) ? codeNum : 0);
      return highest > max ? highest : max;
    }, 0);
    const nextIdx = maxNum + 1;
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
      installment1PaidAtIso: null,
      installment1Slip: null,
      installment2Paid: false,
      installment2PaidAt: null,
      installment2PaidAtIso: null,
      installment2Slip: null
    };

    const newTasks = createDefaultAssignmentsForBooking(newBooking).map(t => enrichTaskWithBooking(t, newBooking));

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'NEW_REQUEST',
      bookingId: newId,
      title: `คำขอจัดงานใหม่ #${newId} (${shortCode})`,
      message: `งานศพ ${newBooking.deceased.prefix}${newBooking.deceased.fullName} (${newBooking.packageName}) นัดหมาย ${newBooking.appointmentDate}`,
      createdAt: 'เมื่อสักครู่',
      isRead: false
    };

    const nextBookings = [newBooking, ...curState.bookings];
    setState(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      assignments: [...newTasks, ...prev.assignments],
      notifications: [newNotif, ...prev.notifications]
    }));

    // บันทึกคำขอจัดงานใหม่ลงตารางทั้งหมดใน Supabase และอัปเดตแพ็กเกจแนะนำตามยอดจองสูงสุด
    trackWrite(syncNewBookingToSupabase(newBooking, newTasks));
    const updatedPkgs = computePackagesWithPopularity(curState.packages, nextBookings);
    const recommendedPkg = updatedPkgs.find(p => p.isRecommended);
    if (recommendedPkg) {
      trackWrite(syncRecommendedPackageByBookingsToSupabase(recommendedPkg.id, updatedPkgs));
    }

    return newBooking;
  };

  // แอดมินอัปเดตเปอร์เซ็นต์งวดแรก และ/หรือ แนบสลิปงวดที่ 1 หรือ งวดที่ 2
  const updateBookingPayment = (bookingId, paymentUpdates) => {
    const target = stateRef.current.bookings.find(b => b.id === bookingId);
    if (!target) return;
    const nowIso = new Date().toISOString();
    const updatedBooking = {
      ...target,
      ...paymentUpdates,
      installment1PaidAtIso: paymentUpdates.installment1Paid && !target.installment1PaidAtIso
        ? nowIso
        : target.installment1PaidAtIso,
      installment2PaidAtIso: paymentUpdates.installment2Paid && !target.installment2PaidAtIso
        ? nowIso
        : target.installment2PaidAtIso
    };

    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => (b.id === bookingId ? updatedBooking : b))
    }));
    trackWrite(syncApprovalAndPaymentToSupabase(updatedBooking));
  };

  // แอดมินแก้ไขรายละเอียดการจัดงาน (คงยอดงวดที่ 1 หากชำระไปแล้ว แล้วนำส่วนต่างไปคำนวณในยอดคงเหลือ)
  const updateBookingDetails = (bookingId, detailsUpdates) => {
    const target = stateRef.current.bookings.find(b => b.id === bookingId);
    if (!target) return;

    const nextNetTotal = detailsUpdates.netTotal !== undefined ? detailsUpdates.netTotal : target.netTotal;
    let nextPaymentOption = target.paymentOption;
    let nextInst1 = target.installment1Amount;
    let nextInst2 = target.installment2Amount;
    let nextInst2Paid = target.installment2Paid;

    if (target.installment1Paid) {
      // งวดแรกชำระแล้ว ห้ามเปลี่ยนยอดที่รับชำระไปแล้ว นำส่วนต่างไปไว้ในงวดที่ 2
      nextInst1 = Number(target.installment1Amount) || 0;
      const diff = Math.max(0, nextNetTotal - nextInst1);
      nextInst2 = diff;
      if (diff > 0) {
        nextPaymentOption = 'INSTALLMENT';
        if (diff > (Number(target.installment2Amount) || 0)) {
          nextInst2Paid = false;
        }
      }
    } else {
      const pct = target.paymentOption === 'FULL' ? 100 : (target.installment1Percent || 25);
      nextInst1 = target.paymentOption === 'FULL' ? nextNetTotal : Math.round((nextNetTotal * pct) / 100);
      nextInst2 = target.paymentOption === 'FULL' ? 0 : Math.max(0, nextNetTotal - nextInst1);
    }

    const updatedBooking = {
      ...target,
      ...detailsUpdates,
      paymentOption: nextPaymentOption,
      installment1Amount: nextInst1,
      installment2Amount: nextInst2,
      installment2Paid: nextInst2Paid
    };

    const venueDisplay = `${updatedBooking.locationName} (${updatedBooking.pavilionName})`;
    const dateRange = updatedBooking.startDate
      ? `${updatedBooking.startDate}${updatedBooking.cremationDate && updatedBooking.cremationDate !== updatedBooking.startDate ? ` ถึง ${updatedBooking.cremationDate}` : ''}`
      : '';

    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => (b.id === bookingId ? updatedBooking : b)),
      assignments: prev.assignments.map(t => {
        if (t.bookingId !== bookingId) return t;
        return {
          ...t,
          workDate: updatedBooking.startDate,
          dateRangeText: dateRange,
          locationName: venueDisplay,
          locationDisplay: venueDisplay
        };
      })
    }));

    trackWrite(syncUpdateBookingDetailsToSupabase(updatedBooking));
  };

  // แอดมินยกเลิกคำขอจัดงาน (คืนคิวศาลา + ปิดใบงานย่อยของแผนก + คำนวณแพ็กเกจแนะนำใหม่)
  const cancelBookingRequest = (bookingId, cancelReason = 'ลูกค้ายกเลิกหรือไม่ได้มาติดต่อตามนัดหมาย') => {
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';

    const nextBookings = stateRef.current.bookings.map(b =>
      b.id === bookingId
        ? { ...b, status: 'ยกเลิก', cancelReason, cancelledAt: nowText }
        : b
    );

    setState(prev => ({
      ...prev,
      bookings: nextBookings,
      assignments: prev.assignments.map(t =>
        t.bookingId === bookingId ? { ...t, status: 'ยกเลิก', bookingStatus: 'ยกเลิก' } : t
      ),
      notifications: prev.notifications.map(n =>
        n.bookingId === bookingId ? { ...n, isRead: true } : n
      )
    }));

    trackWrite(syncCancelBookingToSupabase(bookingId, cancelReason));
    const updatedPkgs = computePackagesWithPopularity(stateRef.current.packages, nextBookings);
    const recommendedPkg = updatedPkgs.find(p => p.isRecommended);
    if (recommendedPkg) {
      trackWrite(syncRecommendedPackageByBookingsToSupabase(recommendedPkg.id, updatedPkgs));
    }
  };

  // แอดมินกดอนุมัติคำขอจัดงาน (ต้องแนบสลิปงวดแรกหรือจ่ายเต็มจำนวนแล้ว)
  const approveBookingRequest = (bookingId) => {
    const target = stateRef.current.bookings.find(b => b.id === bookingId);
    if (!target) return;

    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';

    const approvedBooking = {
      ...target,
      status: 'กำลังดำเนินงาน',
      approvedAt: nowText
    };

    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => (b.id === bookingId ? approvedBooking : b)),
      assignments: prev.assignments.map(t => {
        if (t.bookingId !== bookingId) return t;
        return {
          ...t,
          bookingStatus: 'กำลังดำเนินงาน',
          status: t.status === 'ยังไม่ได้มอบหมาย' ? 'มอบหมายแล้ว' : t.status
        };
      }),
      notifications: prev.notifications.map(n =>
        n.bookingId === bookingId ? { ...n, isRead: true } : n
      )
    }));

    trackWrite(syncApprovalAndPaymentToSupabase(approvedBooking));
  };

  // แอดมินปิดงานเป็นเสร็จสิ้นบริบูรณ์ (เมื่อทุกแผนกเสร็จและชำระครบแล้ว)
  const completeEntireBooking = (bookingId) => {
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'เสร็จสิ้น', completedAt: nowText } : b
      ),
      assignments: prev.assignments.map(t =>
        t.bookingId === bookingId
          ? { ...t, bookingStatus: 'เสร็จสิ้น', status: 'เสร็จสิ้น', currentStep: 4, completedAt: t.completedAt || nowText }
          : t
      )
    }));
    trackWrite(syncCompleteEntireBookingToSupabase(bookingId));
  };

  // แอดมินมอบหมายงานแต่ละส่วนให้แผนกและเจ้าหน้าที่
  const assignTaskToStaff = (taskId, { department, staffId, staffName, staffPhone, note }) => {
    const target = stateRef.current.assignments.find(t => t.id === taskId);
    if (!target) return;
    const updatedTask = {
      ...target,
      department: department !== undefined ? normalizeDepartmentName(department) : target.department,
      staffId: staffId ?? target.staffId,
      staffName: staffName ?? target.staffName,
      staffPhone: staffPhone ?? target.staffPhone,
      note: note !== undefined ? note : target.note,
      status: target.status === 'ยังไม่ได้มอบหมาย' ? 'มอบหมายแล้ว' : target.status
    };

    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(t => (t.id === taskId ? updatedTask : t))
    }));
    trackWrite(syncTaskUpdateToSupabase(updatedTask, { syncChecklists: false, syncPhotos: false }));
  };

  // แผนกปฏิบัติงานกดรับงาน (มอบหมายแล้ว -> กำลังดำเนินงาน)
  const acceptDepartmentTask = (taskId) => {
    const target = stateRef.current.assignments.find(t => t.id === taskId);
    if (!target || target.status === 'เสร็จสิ้น' || target.status === 'ยกเลิก') return;

    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const updatedTask = {
      ...target,
      status: 'กำลังดำเนินงาน',
      currentStep: 2,
      acceptedAt: timeStr
    };

    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(t => (t.id === taskId ? updatedTask : t))
    }));
    trackWrite(syncTaskUpdateToSupabase(updatedTask, { syncChecklists: false, syncPhotos: false }));
  };

  // แผนกปฏิบัติงานติ๊กเช็กลิสต์ย่อย (ล็อกหากงานเสร็จสิ้นแล้ว)
  const toggleTaskChecklist = (taskId, checklistId) => {
    const target = stateRef.current.assignments.find(t => t.id === taskId);
    if (!target || target.status === 'เสร็จสิ้น' || target.status === 'ยกเลิก') return;

    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const updatedList = (target.checklist || []).map(item => {
      if (item.id !== checklistId) return item;
      const nextChecked = !item.isChecked;
      return {
        ...item,
        isChecked: nextChecked,
        completedTime: nextChecked ? timeStr : ''
      };
    });
    const allChecked = updatedList.length > 0 && updatedList.every(i => i.isChecked);
    const updatedTask = {
      ...target,
      status: target.status === 'ยังไม่ได้มอบหมาย' || target.status === 'มอบหมายแล้ว' ? 'กำลังดำเนินงาน' : target.status,
      currentStep: allChecked ? 3 : 2,
      checklist: updatedList
    };

    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(t => (t.id === taskId ? updatedTask : t))
    }));
    trackWrite(syncTaskUpdateToSupabase(updatedTask, { syncChecklists: true, syncPhotos: false }));
  };

  // แผนกปฏิบัติงานอัปโหลดรูปหน้างาน & หมายเหตุ (debounce ตอนพิมพ์ข้อความเพื่อไม่ให้ยิง DB ทุกตัวอักษร)
  const updateTaskPhotosAndNote = (taskId, { photos, fieldNote }) => {
    const target = stateRef.current.assignments.find(t => t.id === taskId);
    if (!target || target.status === 'เสร็จสิ้น' || target.status === 'ยกเลิก') return;

    const updatedTask = {
      ...target,
      photos: photos !== undefined ? photos : target.photos,
      fieldNote: fieldNote !== undefined ? fieldNote : target.fieldNote,
      status: target.status === 'มอบหมายแล้ว' ? 'กำลังดำเนินงาน' : target.status
    };

    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(t => (t.id === taskId ? updatedTask : t))
    }));

    if (photos !== undefined) {
      // อัปโหลดหรือลบรูปให้ซิงก์ทันที
      trackWrite(syncTaskUpdateToSupabase(updatedTask, { syncChecklists: false, syncPhotos: true }));
    } else if (fieldNote !== undefined) {
      // พิมพ์หมายเหตุให้รอ 600ms ก่อนยิง DB (ไม่ลบ-สร้างเช็กลิสต์และรูปซ้ำ)
      if (noteTimersRef.current[taskId]) {
        clearTimeout(noteTimersRef.current[taskId]);
      }
      noteTimersRef.current[taskId] = setTimeout(() => {
        const latest = stateRef.current.assignments.find(t => t.id === taskId);
        if (latest) {
          trackWrite(syncTaskUpdateToSupabase(latest, { syncChecklists: false, syncPhotos: false }));
        }
      }, 600);
    }
  };

  // แผนกปฏิบัติงานกดส่งรายงานความคืบหน้าให้แอดมิน (บันทึกจริง + แจ้งเตือนแอดมิน)
  const reportTaskProgress = (taskId) => {
    const target = stateRef.current.assignments.find(t => t.id === taskId);
    if (!target) return;
    const newNotif = {
      id: `NOTIF-PROG-${Date.now()}`,
      type: 'TASK_UPDATE',
      bookingId: target.bookingId,
      title: `${target.department} รายงานความคืบหน้า #${target.bookingId}`,
      message: target.fieldNote || `อัปเดตงาน "${target.title}" (${(target.checklist || []).filter(c => c.isChecked).length}/${(target.checklist || []).length} ขั้นตอน)`,
      createdAt: 'เมื่อสักครู่',
      isRead: false
    };
    setState(prev => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications].slice(0, 30)
    }));
    trackWrite(syncTaskUpdateToSupabase(target, { syncChecklists: true, syncPhotos: true }));
  };

  // แผนกปฏิบัติงานกดยืนยันการเสร็จสิ้น (ต้องเช็กลิสต์ครบ 100% + มีรูป >= 1 รูป)
  const completeDepartmentTask = (taskId) => {
    const target = stateRef.current.assignments.find(t => t.id === taskId);
    if (!target || target.status === 'เสร็จสิ้น' || target.status === 'ยกเลิก') return;

    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';

    const completedTask = {
      ...target,
      status: 'เสร็จสิ้น',
      currentStep: 4,
      completedAt: nowText
    };

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'TASK_DONE',
      bookingId: completedTask.bookingId,
      title: `${completedTask.department} ส่งมอบงานเสร็จสิ้น`,
      message: `งาน "${completedTask.title}" (รหัส #${completedTask.bookingId}) ทำเช็กลิสต์ครบ 100% และแนบรูปหน้างานแล้ว`,
      createdAt: 'เมื่อสักครู่',
      isRead: false
    };

    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(t => (t.id === taskId ? completedTask : t)),
      notifications: [newNotif, ...prev.notifications].slice(0, 30)
    }));

    trackWrite(syncDepartmentTaskToSupabase(completedTask));
  };

  // การจัดการแพ็กเกจหลัก (Admin CRUD -> ซิงก์ลงตาราง packages)
  const savePackage = async (pkgData) => {
    const curPackages = stateRef.current.packages;
    const exists = curPackages.some(p => p.id === pkgData.id);
    const maxNum = curPackages.reduce((max, p) => {
      const n = parseInt(String(p.id || '').replace(/\D/g, ''), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const nextId = `PKG-${String(maxNum + 1).padStart(2, '0')}`;

    const savedPkg = exists
      ? pkgData
      : { ...pkgData, id: pkgData.id || nextId };

    setState(prev => {
      const alreadyInState = prev.packages.some(p => p.id === savedPkg.id);
      const packages = alreadyInState
        ? prev.packages.map(p => (p.id === savedPkg.id ? savedPkg : p))
        : [...prev.packages, savedPkg];
      return { ...prev, packages };
    });

    const res = await trackWrite(syncSavePackageToSupabase(savedPkg));
    if (res && !res.ok && res.error) {
      console.error('ไม่สามารถซิงก์แพ็กเกจลง Supabase:', res.error);
    }
    return savedPkg;
  };

  const deletePackage = async (pkgId) => {
    const res = await trackWrite(syncDeletePackageFromSupabase(pkgId));
    if (res && res.ok === false) {
      window.alert(res.message || 'ไม่สามารถลบแพ็กเกจนี้ได้');
      return res;
    }
    setState(prev => ({
      ...prev,
      packages: prev.packages.filter(p => p.id !== pkgId)
    }));
    return { ok: true };
  };

  // การจัดการบริการเสริม Add-ons (Admin CRUD -> ซิงก์ลงตาราง items)
  const saveServiceAddon = (serviceData) => {
    const curServices = stateRef.current.services;
    const exists = curServices.some(s => s.id === serviceData.id);
    const maxNum = curServices.reduce((max, s) => {
      const n = parseInt(String(s.id || '').replace(/\D/g, ''), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const nextId = `SRV-${String(maxNum + 1).padStart(2, '0')}`;
    const savedSrv = exists
      ? { ...serviceData, department: normalizeDepartmentName(serviceData.department) }
      : { ...serviceData, id: serviceData.id || nextId, department: normalizeDepartmentName(serviceData.department) };

    setState(prev => ({
      ...prev,
      services: exists
        ? prev.services.map(s => (s.id === savedSrv.id ? savedSrv : s))
        : [...prev.services, savedSrv]
    }));
    trackWrite(syncSaveServiceAddonToSupabase(savedSrv));
  };

  const deleteServiceAddon = async (serviceId) => {
    const res = await trackWrite(syncDeleteServiceAddonFromSupabase(serviceId));
    if (res && res.ok === false) {
      window.alert(res.message || 'ไม่สามารถลบบริการเสริมนี้ได้');
      return res;
    }
    setState(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
    return { ok: true };
  };

  // การจัดการสถานที่/วัด/ศาลา (Admin CRUD -> ซิงก์ลงตาราง temples, temple_images, pavilions)
  const saveLocation = async (locData) => {
    const curLocations = stateRef.current.locations;
    const exists = curLocations.some(l => l.id === locData.id);
    const maxNum = curLocations.reduce((max, l) => {
      const n = parseInt(String(l.id || '').replace(/\D/g, ''), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const nextId = `LOC-${String(maxNum + 1).padStart(2, '0')}`;
    const savedLoc = exists
      ? locData
      : { ...locData, id: locData.id || nextId };

    setState(prev => {
      const alreadyInState = prev.locations.some(l => l.id === savedLoc.id);
      const locations = alreadyInState
        ? prev.locations.map(l => (l.id === savedLoc.id ? savedLoc : l))
        : [...prev.locations, savedLoc];
      return { ...prev, locations };
    });

    const res = await trackWrite(syncSaveLocationToSupabase(savedLoc));
    if (res) {
      setState(prev => ({
        ...prev,
        locations: prev.locations.map(l => {
          if (l.id !== savedLoc.id) return l;
          const basePavs = res.savedPavilions && res.savedPavilions.length > 0 ? res.savedPavilions : (l.pavilions || []);
          const existingPavIds = new Set(basePavs.map(p => p.pavilionId || p.id));
          const restored = (res.blockedPavilions || []).filter(
            bp => !existingPavIds.has(bp.pavilionId) && !existingPavIds.has(bp.id)
          );
          return {
            ...l,
            templeId: res.templeId || l.templeId,
            pavilions: [...basePavs, ...restored]
          };
        })
      }));
      if (res.blockedPavilions && res.blockedPavilions.length > 0) {
        window.alert(res.message || 'ไม่สามารถลบบางศาลาได้ เนื่องจากมีใบจองอ้างอิงใช้งานอยู่');
      }
    }
    return savedLoc;
  };

  const deleteLocation = async (locId) => {
    const target = stateRef.current.locations.find(l => l.id === locId);
    const res = await trackWrite(syncDeleteLocationFromSupabase(target?.templeId || locId));
    if (res && res.ok === false) {
      window.alert(res.message || 'ไม่สามารถลบสถานที่นี้ได้');
      return res;
    }
    setState(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l.id !== locId)
    }));
    return { ok: true };
  };

  // การจัดการแผนกและบุคลากร (Admin CRUD -> ซิงก์ลงตาราง departments & community_workers)
  const addDepartmentTag = (deptName) => {
    if (!deptName.trim()) return;
    const normalized = normalizeDepartmentName(deptName);
    if (stateRef.current.departments.includes(normalized)) return;
    setState(prev => ({
      ...prev,
      departments: prev.departments.includes(normalized) ? prev.departments : [...prev.departments, normalized]
    }));
    trackWrite(syncAddDepartmentToSupabase(normalized));
  };

  const removeDepartmentTag = async (deptName) => {
    const res = await trackWrite(syncRemoveDepartmentFromSupabase(deptName));
    if (res && res.ok === false) {
      window.alert(res.message || 'ไม่สามารถลบแผนกนี้ได้');
      return res;
    }
    setState(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== deptName)
    }));
    return { ok: true };
  };

  const saveStaffMember = (staffData) => {
    const curStaff = stateRef.current.staff;
    const exists = curStaff.some(s => s.id === staffData.id);
    const maxNum = curStaff.reduce((max, s) => {
      const n = parseInt(String(s.id || '').replace(/\D/g, ''), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const nextId = `STF-${String(maxNum + 1).padStart(2, '0')}`;
    const savedStaff = exists
      ? { ...staffData, department: normalizeDepartmentName(staffData.department) }
      : { ...staffData, id: staffData.id || nextId, department: normalizeDepartmentName(staffData.department) };

    setState(prev => ({
      ...prev,
      staff: exists
        ? prev.staff.map(s => (s.id === savedStaff.id ? savedStaff : s))
        : [...prev.staff, savedStaff]
    }));
    trackWrite(syncSaveStaffMemberToSupabase(savedStaff));
  };

  const deleteStaffMember = async (staffId) => {
    const target = stateRef.current.staff.find(s => s.id === staffId);
    const res = await trackWrite(syncDeleteStaffMemberFromSupabase(target?.workerId || staffId));
    if (res && res.ok === false) {
      window.alert(res.message || 'ไม่สามารถลบบุคลากรนี้ได้');
      return res;
    }
    setState(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== staffId)
    }));
    return { ok: true };
  };

  const markNotificationRead = (notifId) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    }));
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
      updateBookingDetails,
      cancelBookingRequest,
      approveBookingRequest,
      completeEntireBooking,
      assignTaskToStaff,
      acceptDepartmentTask,
      toggleTaskChecklist,
      updateTaskPhotosAndNote,
      reportTaskProgress,
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
      markNotificationRead,
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

// Helper แปลงไฟล์เป็น Base64 Data URL พร้อมย่อขนาดและบีบอัดรูปภาพอัตโนมัติ (ป้องกัน localStorage เต็มและซิงก์ขึ้น Supabase เร็วขึ้น)
export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const rawDataUrl = reader.result;
      if (!file?.type?.startsWith('image/') || file.type === 'image/svg+xml') {
        resolve(rawDataUrl);
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        try {
          const MAX_DIM = 1200;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
