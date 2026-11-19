import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Eye,
  Sparkles,
  Building2,
  Clock
} from 'lucide-react';
import { useApp, fileToDataUrl } from '../../context/AppContext';
import { SAMPLE_ID_CARD_DATA_URL, SAMPLE_DEATH_CERT_DATA_URL } from '../../data/initialData';
import { IS_DEMO_MODE } from '../../config/siteConfig';

// Helper จัดการวันที่แบบ Local Time ป้องกัน Timezone shift และ Invalid Date crash
const formatLocalDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseLocalDate = (dateStr) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const addDaysToDateStr = (dateStr, days) => {
  const dt = parseLocalDate(dateStr);
  if (!dt) return '';
  dt.setDate(dt.getDate() + days);
  return formatLocalDate(dt);
};

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    packages,
    services,
    locations,
    ritualTypes,
    bookings,
    createBookingRequest,
    setPreviewImageModal
  } = useApp();

  const todayStr = useMemo(() => formatLocalDate(new Date()), []);

  const recommendedPkg = packages.find(p => p.isRecommended) || packages[2] || packages[0];
  const initialPkgId = searchParams.get('package') || recommendedPkg?.id || 'PKG-03';
  const initialPkg = packages.find(p => p.id === initialPkgId) || recommendedPkg || {
    id: 'PKG-03',
    name: 'แพ็กเกจมาตรฐาน',
    price: 75000,
    durationDays: 4,
    durationNights: 3,
    baseGuests: 150,
    maxGuests: 200,
    defaultRitualId: 'RITUAL-02'
  };
  const paramRitual = searchParams.get('ritual');
  const initialRitualId = (ritualTypes || []).some(r => r.id === paramRitual)
    ? paramRitual
    : (initialPkg.defaultRitualId || 'RITUAL-02');

  const [step, setStep] = useState(1); // 1, 2, 3, 4
  const [selectedPkgId, setSelectedPkgId] = useState(initialPkg.id);
  const selectedPkg = packages.find(p => p.id === selectedPkgId) || initialPkg;

  // Step 1: ข้อมูลผู้ติดต่อ & ผู้เสียชีวิต & เอกสารแนบ
  const [contact, setContact] = useState({
    prefix: 'นาย',
    fullName: '',
    relationship: '',
    phone: '',
    backupPhone: '',
    address: '',
    province: 'เชียงใหม่',
    district: 'สันทราย',
    subdistrict: 'หนองหาร',
    postalCode: '50290',
    lineId: '',
    email: '',
    idCardDoc: ''
  });

  const [deceased, setDeceased] = useState({
    prefix: 'นาย',
    fullName: '',
    nationalId: '',
    gender: 'ชาย',
    birthDate: '',
    deathDate: '',
    age: '',
    placeOfDeath: 'โรงพยาบาลสันทราย',
    deathCertDoc: ''
  });

  const [step1Error, setStep1Error] = useState('');

  // Step 2: จำนวนแขก, รายการเสริม (Add-ons), และรูปแบบพิธีกรรม
  const [guestCount, setGuestCount] = useState(selectedPkg.baseGuests || 50);
  const [selectedAddons, setSelectedAddons] = useState({}); // { [serviceId]: qty }
  const [selectedRitualId, setSelectedRitualId] = useState(initialRitualId);

  // Step 3: สถานที่/ศาลา (กรองเฉพาะสถานที่และศาลาที่เปิดให้บริการ)
  const activeLocations = useMemo(
    () => (locations || []).filter(l => l.isActive !== false),
    [locations]
  );
  const [locationId, setLocationId] = useState(activeLocations[0]?.id || 'LOC-01');
  const currentLocation = activeLocations.find(l => l.id === locationId) || activeLocations[0];
  const activePavilions = useMemo(
    () => (currentLocation?.pavilions || []).filter(p => p.isActive !== false),
    [currentLocation]
  );
  const [pavilionId, setPavilionId] = useState(activePavilions[0]?.id || 'PAV-01');

  useEffect(() => {
    if (activeLocations.length > 0 && !activeLocations.some(l => l.id === locationId)) {
      setLocationId(activeLocations[0].id);
    }
  }, [activeLocations, locationId]);

  useEffect(() => {
    if (activePavilions.length > 0 && !activePavilions.some(p => p.id === pavilionId)) {
      setPavilionId(activePavilions[0].id);
    }
  }, [activePavilions, pavilionId]);

  // ปฏิทินเริ่มต้นที่เดือนปัจจุบัน และวันเริ่มงานเริ่มต้นตามจำนวนวันของแพ็กเกจ
  const defaultStart = useMemo(() => addDaysToDateStr(todayStr, 1), [todayStr]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [startDate, setStartDate] = useState(defaultStart);
  const [cremationDate, setCremationDate] = useState(() =>
    addDaysToDateStr(defaultStart, Math.max(0, (initialPkg.durationDays || 3) - 1))
  );
  const [boneDate, setBoneDate] = useState(() =>
    addDaysToDateStr(defaultStart, Math.max(1, initialPkg.durationDays || 3))
  );
  const [step3Error, setStep3Error] = useState('');

  // Step 4: รูปแบบการชำระเงิน & วันเวลานัดหมายที่ศูนย์บริการ
  const [paymentOption, setPaymentOption] = useState('INSTALLMENT'); // 'FULL' | 'INSTALLMENT'
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [appointmentTime, setAppointmentTime] = useState('09:00 - 10:00 น.');
  const [step4Error, setStep4Error] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // คำนวณส่วนต่างพิธีกรรมจากข้อมูล ritualTypes จริง
  const ritualUpgradePrice = useMemo(() => {
    if (selectedRitualId === selectedPkg.defaultRitualId) return 0;
    const targetRitual = (ritualTypes || []).find(r => r.id === selectedRitualId);
    if (!targetRitual) return 0;
    if (selectedPkg.defaultRitualId === 'RITUAL-03') return Number(targetRitual.upgradePriceFrom3) || 0;
    if (selectedPkg.defaultRitualId === 'RITUAL-02') return Number(targetRitual.upgradePriceFrom2) || 0;
    return 0;
  }, [selectedRitualId, selectedPkg, ritualTypes]);

  // คำนวณค่าใช้จ่ายกรณีเพิ่มจำนวนแขกเกินจำนวนตั้งต้นในแพ็กเกจ (150 บาท/คน)
  const EXTRA_GUEST_RATE = 150;
  const maxGuestsCap = selectedPkg.maxGuests || 300;
  const extraGuestsCount = Math.max(0, guestCount - (selectedPkg.baseGuests || 50));
  const extraGuestsCost = extraGuestsCount * EXTRA_GUEST_RATE;

  // คำนวณรายการเสริมที่เลือก
  const addonItemsList = useMemo(() => {
    return Object.entries(selectedAddons)
      .filter(([, qty]) => qty > 0)
      .map(([srvId, qty]) => {
        const srv = services.find(s => s.id === srvId);
        if (!srv) return null;
        return {
          id: srv.id,
          name: srv.name,
          unit: srv.unit,
          price: srv.price,
          qty,
          total: srv.price * qty
        };
      })
      .filter(Boolean);
  }, [selectedAddons, services]);

  const addonsOnlyTotal = useMemo(
    () => addonItemsList.reduce((sum, item) => sum + item.total, 0),
    [addonItemsList]
  );

  const addonsTotal = addonsOnlyTotal + extraGuestsCost;
  const netTotal = (Number(selectedPkg.price) || 0) + ritualUpgradePrice + addonsTotal;

  // คำนวณอายุอัตโนมัติเมื่อเลือกวันเกิดและวันเสียชีวิต
  const computeAgeYears = (bDateStr, dDateStr) => {
    if (!bDateStr) return '';
    const birth = parseLocalDate(bDateStr);
    const ref = dDateStr ? parseLocalDate(dDateStr) : new Date();
    if (!birth || !ref) return '';
    let age = ref.getFullYear() - birth.getFullYear();
    const m = ref.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age >= 0 ? String(age) : '';
  };

  const handleBirthOrDeathChange = (field, val) => {
    setDeceased(prev => {
      const next = { ...prev, [field]: val };
      const nextBirth = field === 'birthDate' ? val : prev.birthDate;
      const nextDeath = field === 'deathDate' ? val : prev.deathDate;
      next.age = computeAgeYears(nextBirth, nextDeath);
      return next;
    });
  };

  // ฟังก์ชันกรอกข้อมูลตัวอย่างอัตโนมัติ (เฉพาะโหมดสาธิต)
  const handleFillSampleStep1 = () => {
    setContact({
      prefix: 'นาย',
      fullName: 'เจริญ ใจบุญ',
      relationship: 'บุตรชาย',
      phone: '089-456-7890',
      backupPhone: '081-111-2222',
      address: '99 หมู่ 8 บ้านวิเวก',
      province: 'เชียงใหม่',
      district: 'สันทราย',
      subdistrict: 'หนองหาร',
      postalCode: '50290',
      lineId: 'charoen_cm',
      email: 'charoen@email.com',
      idCardDoc: SAMPLE_ID_CARD_DATA_URL
    });
    setDeceased({
      prefix: 'นาย',
      fullName: 'คำปัน ใจบุญ',
      nationalId: '1-5014-00987-65-4',
      gender: 'ชาย',
      birthDate: '1948-04-12',
      deathDate: todayStr,
      age: computeAgeYears('1948-04-12', todayStr),
      placeOfDeath: 'โรงพยาบาลสันทราย',
      deathCertDoc: SAMPLE_DEATH_CERT_DATA_URL
    });
    setStep1Error('');
  };

  // อัปโหลดไฟล์เอกสารเป็น Base64 Data URL พร้อมตรวจประเภทและขนาดไฟล์
  const handleUploadDoc = async (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setStep1Error('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG) หรือ PDF เท่านั้น');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStep1Error('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      if (targetField === 'contactIdCard') {
        setContact(prev => ({ ...prev, idCardDoc: dataUrl }));
      } else if (targetField === 'deceasedCert') {
        setDeceased(prev => ({ ...prev, deathCertDoc: dataUrl }));
      }
      setStep1Error('');
    } catch (err) {
      console.error('Upload error:', err);
      setStep1Error('ไม่สามารถอ่านไฟล์เอกสารได้ กรุณาลองอัปโหลดใหม่อีกครั้ง');
    }
  };

  // ตรวจสอบ Step 1 ก่อนไป Step 2
  const handleNextFromStep1 = () => {
    if (!contact.fullName.trim() || !contact.phone.trim() || !contact.relationship.trim() || !contact.address.trim() || !contact.postalCode.trim()) {
      setStep1Error('กรุณากรอกข้อมูลผู้ติดต่อที่มีเครื่องหมาย * ให้ครบถ้วน');
      return;
    }
    const phoneDigits = contact.phone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 10) {
      setStep1Error('กรุณากรอกเบอร์โทรศัพท์ผู้ติดต่อให้ถูกต้อง (ตัวเลข 9-10 หลัก)');
      return;
    }
    if (!deceased.prefix?.trim() || !deceased.fullName.trim() || !deceased.nationalId.trim() || !deceased.birthDate || !deceased.deathDate) {
      setStep1Error('กรุณากรอกข้อมูลผู้เสียชีวิตที่มีเครื่องหมาย * ให้ครบถ้วน');
      return;
    }
    const nidDigits = deceased.nationalId.replace(/\D/g, '');
    if (nidDigits.length !== 13) {
      setStep1Error('กรุณากรอกเลขประจำตัวประชาชนผู้เสียชีวิตให้ครบ 13 หลัก');
      return;
    }
    if (deceased.deathDate > todayStr) {
      setStep1Error('วันที่เสียชีวิตต้องไม่เป็นวันในอนาคต');
      return;
    }
    if (deceased.birthDate > deceased.deathDate) {
      setStep1Error('วันเดือนปีเกิดของผู้เสียชีวิตต้องไม่เป็นวันหลังจากวันที่เสียชีวิต');
      return;
    }
    if (!contact.idCardDoc || !deceased.deathCertDoc) {
      setStep1Error('กรุณาแนบทั้ง "สำเนาบัตรประชาชนผู้ติดต่อ" และ "ใบมรณบัตรผู้เสียชีวิต" ก่อนไปขั้นตอนถัดไป');
      return;
    }
    setStep1Error('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // จัดการติ๊กและปรับจำนวนรายการเสริมใน Step 2
  const toggleAddonCheckbox = (srvId) => {
    setSelectedAddons(prev => {
      const current = prev[srvId] || 0;
      return { ...prev, [srvId]: current > 0 ? 0 : 1 };
    });
  };

  const changeAddonQty = (srvId, delta) => {
    setSelectedAddons(prev => {
      const current = prev[srvId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [srvId]: next };
    });
  };

  // ตรวจสอบคิวว่างของวัดและศาลาในปฏิทิน Step 3 (รวมวันเก็บอัฐิด้วย)
  const getDateBookingStatus = (dateStr) => {
    const matchedBookings = bookings.filter(b => {
      if (b.status === 'ยกเลิก') return false;
      if (b.locationId !== locationId) return false;
      const bookingEnd = b.boneCollectionDate || b.cremationDate || b.startDate;
      return dateStr >= b.startDate && dateStr <= bookingEnd;
    });

    const isSelectedPavilionBooked = matchedBookings.some(b => b.pavilionId === pavilionId);
    const totalPavilions = Math.max(1, activePavilions.length);
    const bookedPavilionsCount = new Set(matchedBookings.map(b => b.pavilionId)).size;

    return {
      isSelectedPavilionBooked,
      bookedPavilionsCount,
      isAllZonesFull: bookedPavilionsCount >= totalPavilions,
      matchedBookings
    };
  };

  // ตรวจสอบว่าช่วงวัน [rangeStart, rangeEnd] ทับซ้อนกับงานอื่นในศาลาที่เลือกหรือไม่
  const findPavilionRangeConflict = (rangeStart, rangeEnd, targetLocId = locationId, targetPavId = pavilionId) => {
    if (!rangeStart || !rangeEnd) return null;
    return bookings.find(b => {
      if (b.status === 'ยกเลิก') return false;
      if (b.locationId !== targetLocId || b.pavilionId !== targetPavId) return false;
      const bookingEnd = b.boneCollectionDate || b.cremationDate || b.startDate;
      return rangeStart <= bookingEnd && rangeEnd >= b.startDate;
    }) || null;
  };

  // คลิกเลือกวันในปฏิทิน (ป้องกัน Invalid Date crash และวันย้อนหลัง)
  const handleSelectCalendarDate = (dateStr) => {
    if (!dateStr) {
      setStartDate('');
      setCremationDate('');
      setBoneDate('');
      return;
    }
    const startObj = parseLocalDate(dateStr);
    if (!startObj) return;

    if (dateStr < todayStr) {
      setStep3Error('ไม่สามารถเลือกวันตั้งศพย้อนหลังได้ กรุณาเลือกตั้งแต่วันนี้เป็นต้นไป');
      return;
    }

    const nextStart = formatLocalDate(startObj);
    const nextCrem = addDaysToDateStr(nextStart, Math.max(0, (selectedPkg.durationDays || 3) - 1));
    const nextBone = addDaysToDateStr(nextCrem, 1);

    const conflictBooking = findPavilionRangeConflict(nextStart, nextBone);
    if (conflictBooking) {
      const bEnd = conflictBooking.boneCollectionDate || conflictBooking.cremationDate;
      setStep3Error(
        `ช่วงวันที่ ${nextStart} ถึง ${nextBone} ศาลานี้มีคิวงาน (${conflictBooking.code} คุณ${conflictBooking.deceased?.fullName}) จองอยู่แล้ว (${conflictBooking.startDate} - ${bEnd}) กรุณาเลือกวันอื่นหรือเปลี่ยนศาลา`
      );
      return;
    }
    setStep3Error('');

    setStartDate(nextStart);
    setCremationDate(nextCrem);
    setBoneDate(nextBone);

    // ตั้งวันนัดหมายติดต่อศูนย์บริการเป็น 1 วันก่อนเริ่มงาน (แต่ไม่ย้อนหลังกว่าวันนี้)
    const suggestedAppt = addDaysToDateStr(nextStart, -1);
    setAppointmentDate(suggestedAppt < todayStr ? todayStr : suggestedAppt);
  };

  const handleNextFromStep3 = () => {
    if (!currentLocation || activePavilions.length === 0) {
      setStep3Error('ขณะนี้ยังไม่มีสถานที่หรือศาลาที่เปิดให้บริการ กรุณาติดต่อเจ้าหน้าที่');
      return;
    }
    if (!startDate || !cremationDate || !boneDate) {
      setStep3Error('กรุณาระบุวันตั้งศพวันแรก วันฌาปนกิจ และวันเก็บกระดูกให้ครบถ้วน');
      return;
    }
    if (startDate < todayStr) {
      setStep3Error('วันตั้งศพวันแรกต้องไม่เป็นวันในอดีต');
      return;
    }
    if (deceased.deathDate && startDate < deceased.deathDate) {
      setStep3Error(`วันตั้งศพวันแรก (${startDate}) ต้องไม่เป็นวันก่อนวันที่เสียชีวิต (${deceased.deathDate})`);
      return;
    }
    if (cremationDate < startDate) {
      setStep3Error('วันฌาปนกิจต้องไม่ก่อนวันตั้งศพวันแรก');
      return;
    }
    if (boneDate < cremationDate) {
      setStep3Error('วันเก็บกระดูกต้องไม่ก่อนวันฌาปนกิจ');
      return;
    }
    const conflictBooking = findPavilionRangeConflict(startDate, boneDate);
    if (conflictBooking) {
      const bEnd = conflictBooking.boneCollectionDate || conflictBooking.cremationDate;
      setStep3Error(
        `ช่วงวันที่เลือก (${startDate} ถึง ${boneDate}) ทับซ้อนกับคิวงาน ${conflictBooking.code} ในศาลานี้ (${conflictBooking.startDate} - ${bEnd}) กรุณาเลือกช่วงวันอื่นหรือเปลี่ยนศาลา`
      );
      return;
    }
    setStep3Error('');
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // กดยืนยันส่งคำขอจัดงานใน Step 4
  const handleSubmitBooking = () => {
    if (isSubmitting) return;
    if (!appointmentDate) {
      setStep4Error('กรุณาระบุวันที่นัดหมายเข้าติดต่อศูนย์บริการ');
      return;
    }
    if (appointmentDate < todayStr) {
      setStep4Error('วันที่นัดหมายต้องไม่เป็นวันในอดีต');
      return;
    }
    if (startDate && appointmentDate > startDate) {
      setStep4Error('วันที่นัดหมายติดต่อศูนย์บริการควรอยู่ก่อนหรือภายในวันตั้งศพวันแรก');
      return;
    }
    const finalConflict = findPavilionRangeConflict(startDate, boneDate);
    if (finalConflict) {
      setStep4Error(`ขออภัย ศาลาที่เลือกเพิ่งถูกจองในช่วงวันดังกล่าว (${finalConflict.code}) กรุณาย้อนกลับไปเลือกวันหรือศาลาใหม่`);
      return;
    }

    setStep4Error('');
    setIsSubmitting(true);

    const selectedRitual = ritualTypes.find(r => r.id === selectedRitualId) || ritualTypes[1];
    const selectedPavilion = activePavilions.find(p => p.id === pavilionId) || activePavilions[0];

    const newBooking = createBookingRequest({
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      packagePrice: selectedPkg.price,
      durationDays: selectedPkg.durationDays,
      durationNights: selectedPkg.durationNights,
      baseGuests: selectedPkg.baseGuests,
      extraGuests: extraGuestsCount,
      extraGuestsCost,
      totalGuests: guestCount,
      ritualId: selectedRitual.id,
      ritualName: selectedRitual.name,
      ritualUpgradePrice,
      locationId: currentLocation?.id || 'LOC-01',
      locationName: currentLocation?.name || 'วัดวิเวกวนาราม',
      pavilionId: selectedPavilion?.id || 'PAV-01',
      pavilionName: selectedPavilion?.name || 'ศาลา 1',
      startDate,
      cremationDate,
      boneCollectionDate: boneDate,
      appointmentDate,
      appointmentTime,
      paymentOption,
      installment1Percent: paymentOption === 'FULL' ? 100 : 25,
      installment1Amount: paymentOption === 'FULL' ? netTotal : Math.round(netTotal * 0.25),
      installment2Amount: paymentOption === 'FULL' ? 0 : netTotal - Math.round(netTotal * 0.25),
      addons: addonItemsList,
      addonsTotal,
      netTotal,
      contact,
      deceased
    });

    navigate(`/booking/success?req=${newBooking.id}`);
  };

  // สร้างตารางวันในปฏิทินสำหรับเดือนที่เลือก (เลขวันเดือนถัดไปเรียง 1, 2, 3... ถูกต้อง)
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, isCurrentMonth: false, dateStr: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        day: d,
        isCurrentMonth: true,
        dateStr: `${year}-${mStr}-${dStr}`
      });
    }
    let nextMonthDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextMonthDay++, isCurrentMonth: false, dateStr: null });
    }
    return cells;
  }, [calendarMonth]);

  // จัดกลุ่มบริการเสริมตามหมวดหมู่
  const servicesByCategory = useMemo(() => {
    return services.reduce((acc, srv) => {
      if (!srv.isActive) return acc;
      if (!acc[srv.category]) acc[srv.category] = [];
      acc[srv.category].push(srv);
      return acc;
    }, {});
  }, [services]);

  const stepTitles = [
    { no: 1, label: 'ข้อมูลผู้ติดต่อและผู้เสียชีวิต' },
    { no: 2, label: 'เพิ่มรายการเสริม' },
    { no: 3, label: 'ตรวจสอบสถานะศาลา & วันจัดงาน' },
    { no: 4, label: 'การชำระเงิน & นัดหมายศูนย์บริการ' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="text-xs text-stone-400 mb-4 flex flex-wrap items-center gap-2">
        <Link to="/" className="hover:text-stone-600">หน้าหลัก</Link>
        <span>&gt;</span>
        <Link to="/packages" className="hover:text-stone-600">แพ็กเกจจัดงาน</Link>
        <span>&gt;</span>
        <span className="text-stone-700 font-medium">{stepTitles[step - 1].label}</span>
      </div>

      {/* Stepper แสดงลำดับ 4 ขั้นตอนด้านบน */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E6DAC3] shadow-sm mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stepTitles.map(s => {
            const isActive = step === s.no;
            const isDone = step > s.no;
            return (
              <div
                key={s.no}
                onClick={() => {
                  if (isDone) setStep(s.no);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                  isActive
                    ? 'border-[#2E5A44] bg-[#F4F9F6]'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/50 cursor-pointer'
                    : 'border-stone-200 bg-stone-50 opacity-70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive
                      ? 'bg-[#2E5A44] text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-300 text-stone-700'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.no}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-stone-400 font-medium">ขั้นตอนที่ {s.no}</p>
                  <p className="text-xs font-semibold text-stone-800 truncate">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          STEP 1: ข้อมูลผู้ติดต่อ & ผู้เสียชีวิต + แนบเอกสารสำคัญ (ตามรูปที่ 2)
      ===================================================================== */}
      {step === 1 && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-stone-900">ข้อมูลผู้ติดต่อ</h1>
            {IS_DEMO_MODE && (
              <button
                type="button"
                onClick={handleFillSampleStep1}
                className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                กรอกข้อมูลตัวอย่างอัตโนมัติ (โหมดสาธิต)
              </button>
            )}
          </div>

          {step1Error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{step1Error}</span>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-8">
            {/* ส่วนที่ 1: ข้อมูลผู้ติดต่อ */}
            <div className="space-y-4">
              <h2 className="font-bold text-sm sm:text-base text-stone-900">
                ข้อมูลผู้ติดต่อ (ญาติหรือผู้รับผิดชอบจัดงาน)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    คำนำหน้า <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contact.prefix}
                    onChange={e => setContact({ ...contact, prefix: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9B7B45]"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="กรอกชื่อ-นามสกุลผู้ติดต่อ"
                    value={contact.fullName}
                    onChange={e => setContact({ ...contact, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9B7B45]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ความสัมพันธ์กับผู้เสียชีวิต <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น บุตร, คู่สมรส, หลาน"
                    value={contact.relationship}
                    onChange={e => setContact({ ...contact, relationship: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9B7B45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={contact.phone}
                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9B7B45]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    เบอร์โทรศัพท์สำรอง <span className="text-stone-400">(ถ้ามี)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={contact.backupPhone}
                    onChange={e => setContact({ ...contact, backupPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9B7B45]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  ที่อยู่ผู้ติดต่อ <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
                  value={contact.address}
                  onChange={e => setContact({ ...contact, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9B7B45]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    จังหวัด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="booking-provinces"
                    value={contact.province}
                    onChange={e => setContact({ ...contact, province: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                  <datalist id="booking-provinces">
                    <option value="เชียงใหม่" />
                    <option value="ลำพูน" />
                    <option value="เชียงราย" />
                    <option value="ลำปาง" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    อำเภอ / เขต <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="booking-districts"
                    value={contact.district}
                    onChange={e => setContact({ ...contact, district: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                  <datalist id="booking-districts">
                    <option value="สันทราย" />
                    <option value="เมืองเชียงใหม่" />
                    <option value="ดอยสะเก็ด" />
                    <option value="แม่ริม" />
                    <option value="สารภี" />
                    <option value="สันกำแพง" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ตำบล / แขวง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="booking-subdistricts"
                    value={contact.subdistrict}
                    onChange={e => setContact({ ...contact, subdistrict: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                  <datalist id="booking-subdistricts">
                    <option value="หนองหาร" />
                    <option value="แม่แฝก" />
                    <option value="สันทรายหลวง" />
                    <option value="หนองจ๊อม" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    รหัสไปรษณีย์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.postalCode}
                    onChange={e => setContact({ ...contact, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Line ID <span className="text-stone-400">(ถ้ามี)</span>
                  </label>
                  <input
                    type="text"
                    value={contact.lineId}
                    onChange={e => setContact({ ...contact, lineId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    อีเมล <span className="text-stone-400">(ถ้ามี)</span>
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={e => setContact({ ...contact, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <hr className="border-stone-200" />

            {/* ส่วนที่ 2: ข้อมูลผู้เสียชีวิต */}
            <div className="space-y-4">
              <h2 className="font-bold text-sm sm:text-base text-stone-900">ข้อมูลผู้เสียชีวิต</h2>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    คำนำหน้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="นาย / นาง / นางสาว"
                    value={deceased.prefix}
                    onChange={e => setDeceased({ ...deceased, prefix: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ชื่อ-นามสกุลผู้เสียชีวิต"
                    value={deceased.fullName}
                    onChange={e => setDeceased({ ...deceased, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    เลขประจำตัวประชาชน 13 หลัก <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="X-XXXX-XXXXX-XX-X"
                    value={deceased.nationalId}
                    onChange={e => setDeceased({ ...deceased, nationalId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-2">
                  เพศ <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-8 text-sm">
                  {['ชาย', 'หญิง', 'ไม่ระบุ'].map(g => (
                    <label key={g} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={deceased.gender === g}
                        onChange={() => setDeceased({ ...deceased, gender: g })}
                        className="w-4 h-4 accent-[#2E5A44]"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    วัน เดือน ปีเกิด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={deceased.birthDate}
                    onChange={e => handleBirthOrDeathChange('birthDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    วัน เดือน ปีเสียชีวิต <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={deceased.deathDate}
                    onChange={e => handleBirthOrDeathChange('deathDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">อายุ (ปี) <span className="text-stone-400 text-[10px]">(คำนวณอัตโนมัติ)</span></label>
                  <input
                    type="number"
                    placeholder="เช่น 75"
                    value={deceased.age}
                    onChange={e => setDeceased({ ...deceased, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">สถานที่เสียชีวิต</label>
                  <input
                    type="text"
                    placeholder="เช่น โรงพยาบาลสันทราย"
                    value={deceased.placeOfDeath}
                    onChange={e => setDeceased({ ...deceased, placeOfDeath: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <hr className="border-stone-200" />

            {/* ส่วนที่ 3: เอกสารสำคัญ (ใช้ FileReader เก็บ Base64 Data URL) */}
            <div className="space-y-4">
              <h2 className="font-bold text-sm sm:text-base text-stone-900">เอกสารสำคัญ</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                {/* สำเนาบัตรประชาชนผู้ติดต่อ */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    สำเนาบัตรประชาชนผู้ติดต่อ <span className="text-red-500">*</span>
                  </label>
                  <label className="cursor-pointer block rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#9B7B45] bg-stone-50/50 p-4 text-center transition h-44 flex flex-col items-center justify-center relative overflow-hidden">
                    {contact.idCardDoc ? (
                      <>
                        <img
                          src={contact.idCardDoc}
                          alt="สำเนาบัตรประชาชนผู้ติดต่อ"
                          className="h-28 object-contain rounded mb-2"
                        />
                        <span className="text-[11px] font-semibold text-emerald-700">
                          ✓ แนบไฟล์แล้ว (คลิกเพื่อเปลี่ยนรูป)
                        </span>
                      </>
                    ) : (
                      <>
                        <FolderUp className="w-12 h-12 text-stone-400 mb-2" />
                        <span className="text-xs text-stone-500 font-medium">อัปโหลดรูป</span>
                        <span className="text-[10px] text-stone-400 mt-0.5">รองรับไฟล์ JPG, PNG</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleUploadDoc(e, 'contactIdCard')}
                      className="hidden"
                    />
                  </label>
                  {contact.idCardDoc && (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImageModal({
                          title: 'สำเนาบัตรประชาชนผู้ติดต่อ',
                          url: contact.idCardDoc
                        })
                      }
                      className="mt-2 text-xs font-medium text-[#2E5A44] flex items-center gap-1 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" /> กดดูภาพขยาย
                    </button>
                  )}
                </div>

                {/* ใบมรณบัตรผู้เสียชีวิต */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    ใบมรณบัตรผู้เสียชีวิต (หรือสำเนาบัตรผู้เสียชีวิต) <span className="text-red-500">*</span>
                  </label>
                  <label className="cursor-pointer block rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#9B7B45] bg-stone-50/50 p-4 text-center transition h-44 flex flex-col items-center justify-center relative overflow-hidden">
                    {deceased.deathCertDoc ? (
                      <>
                        <img
                          src={deceased.deathCertDoc}
                          alt="ใบมรณบัตรผู้เสียชีวิต"
                          className="h-28 object-contain rounded mb-2"
                        />
                        <span className="text-[11px] font-semibold text-emerald-700">
                          ✓ แนบไฟล์แล้ว (คลิกเพื่อเปลี่ยนรูป)
                        </span>
                      </>
                    ) : (
                      <>
                        <FolderUp className="w-12 h-12 text-stone-400 mb-2" />
                        <span className="text-xs text-stone-500 font-medium">อัปโหลดรูป</span>
                        <span className="text-[10px] text-stone-400 mt-0.5">รองรับไฟล์ JPG, PNG</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleUploadDoc(e, 'deceasedCert')}
                      className="hidden"
                    />
                  </label>
                  {deceased.deathCertDoc && (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImageModal({
                          title: 'ใบมรณบัตรผู้เสียชีวิต',
                          url: deceased.deathCertDoc
                        })
                      }
                      className="mt-2 text-xs font-medium text-[#2E5A44] flex items-center gap-1 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" /> กดดูภาพขยาย
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Link
              to={`/packages/${selectedPkg.id}`}
              className="px-6 py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 text-sm font-semibold transition"
            >
              ย้อนกลับ
            </Link>
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="px-8 py-2.5 rounded-xl bg-[#3D7352] hover:bg-[#2E5A44] text-white text-sm font-semibold shadow transition"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2: เพิ่มรายการเสริม (Add-ons) & สรุปรายการ (ตามรูปที่ 3)
      ===================================================================== */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-6">เพิ่มรายการเสริม</h1>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DAC3] shadow-sm space-y-8">
            {/* การ์ดแพ็กเกจด้านบน */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-6 border-b border-stone-200">
              <div className="lg:col-span-4">
                <div className="rounded-2xl overflow-hidden bg-[#FDF6E9] border border-[#E6DAC3] h-44">
                  <img src={selectedPkg.coverImage} alt={selectedPkg.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C5A067] text-white text-[11px] font-semibold">
                    ★ แพ็กเกจที่เลือก
                  </span>
                  <select
                    value={selectedPkgId}
                    onChange={e => {
                      const nextPkg = packages.find(p => p.id === e.target.value);
                      if (nextPkg) {
                        setSelectedPkgId(nextPkg.id);
                        setGuestCount(nextPkg.baseGuests);
                        setSelectedRitualId(nextPkg.defaultRitualId);
                        if (startDate) {
                          const nextCrem = addDaysToDateStr(startDate, Math.max(0, (nextPkg.durationDays || 3) - 1));
                          setCremationDate(nextCrem);
                          setBoneDate(addDaysToDateStr(nextCrem, 1));
                        }
                      }
                    }}
                    className="text-xs border border-stone-300 rounded-lg px-2 py-1 bg-stone-50"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>เปลี่ยนเป็น: {p.name}</option>
                    ))}
                  </select>
                </div>
                <h2 className="text-2xl font-bold text-stone-900">{selectedPkg.name}</h2>
                <p className="text-xs text-stone-600">{selectedPkg.tagline}</p>
                <div className="text-xs space-y-1 pt-1 text-stone-700">
                  <p><span className="text-stone-400 mr-3">เหมาะสำหรับ</span> {selectedPkg.targetGroup}</p>
                  <p><span className="text-stone-400 mr-3">รองรับแขก</span> ประมาณ {selectedPkg.baseGuests} คน</p>
                  <p><span className="text-stone-400 mr-3">ระยะเวลา</span> {selectedPkg.durationText}</p>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-stone-200 p-4 bg-[#FDFBF7] text-center space-y-2">
                  <p className="text-xs text-stone-500">ราคาเริ่มต้น</p>
                  <p className="text-2xl font-bold text-[#2E5A44]">
                    {Number(selectedPkg.price || 0).toLocaleString()} <span className="text-xs font-normal text-stone-600">บาท</span>
                  </p>
                  <p className="text-[10px] text-stone-400">(ราคาไม่รวมค่าใช้จ่ายที่เพิ่มเองบางรายการ)</p>
                  <Link
                    to={`/packages/${selectedPkg.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    รายละเอียด (เปิดแท็บใหม่)
                  </Link>
                </div>
              </div>
            </div>

            {/* ปรับจำนวนแขกผู้มาร่วมงาน */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm text-stone-900">จำนวนแขกผู้มาร่วมงาน</h3>
                <span className="text-xs text-stone-400">
                  *รองรับตั้งต้นในแพ็กเกจ: {selectedPkg.baseGuests} คน ไม่สามารถลดจำนวนแขกต่ำกว่าตั้งต้นได้
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <span className="text-xs font-medium text-stone-700">ปรับจำนวนแขก</span>
                <div className="inline-flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(selectedPkg.baseGuests, guestCount - 10))}
                    className="px-3 py-1 text-sm font-bold text-stone-600 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-stone-800 border-x border-stone-200">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.min(maxGuestsCap, guestCount + 10))}
                    className="px-3 py-1 text-sm font-bold text-stone-600 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-700">คน</span>
                {extraGuestsCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                    +เพิ่ม {extraGuestsCount} คน (+{extraGuestsCost.toLocaleString()} บาท สำหรับชุดอาหารว่าง น้ำดื่ม และเก้าอี้รับรอง)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-red-500">
                *เพิ่มแขกได้ไม่เกิน {maxGuestsCap} คนสำหรับ{selectedPkg.name} (คิดค่าบริการรองรับแขกเพิ่มท่านละ {EXTRA_GUEST_RATE} บาท)
              </p>
            </div>

            {/* ตารางเลือกบริการเสริม แยกตามหมวดหมู่ (ดึงจาก State services ของ Admin) */}
            <div className="space-y-6">
              {Object.entries(servicesByCategory).map(([categoryTitle, items]) => (
                <div key={categoryTitle} className="space-y-2">
                  <div className="bg-[#F5E9D6] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-stone-800">
                    <span>{categoryTitle}</span>
                    <span className="mr-24">ราคาต่อหน่วย</span>
                  </div>
                  <div className="divide-y divide-stone-100 px-2">
                    {items.map((srv, idx) => {
                      const qty = selectedAddons[srv.id] || 0;
                      const isChecked = qty > 0;
                      return (
                        <div key={srv.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-stone-700 font-medium">
                            {idx + 1}. {srv.name}
                          </span>
                          <div className="flex items-center gap-6">
                            <span className="w-20 text-right font-medium text-stone-700">
                              {srv.price.toLocaleString()}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleAddonCheckbox(srv.id)}
                              className="w-4 h-4 accent-stone-700 rounded cursor-pointer"
                            />
                            <div className="inline-flex items-center border border-stone-200 rounded-lg bg-stone-50">
                              <button
                                type="button"
                                onClick={() => changeAddonQty(srv.id, -1)}
                                className="px-2.5 py-0.5 text-stone-500 hover:text-stone-800"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => changeAddonQty(srv.id, 1)}
                                className="px-2.5 py-0.5 text-stone-500 hover:text-stone-800"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* สรุปรายการทั้งหมด ตามรูปที่ 3 */}
            <div className="pt-4 space-y-4">
              <h3 className="font-bold text-base text-stone-900">สรุปรายการทั้งหมด</h3>

              <div className="border border-[#E6DAC3] rounded-2xl overflow-hidden">
                <div className="bg-[#F5E9D6] px-5 py-2.5 grid grid-cols-12 text-xs font-bold text-stone-800">
                  <div className="col-span-6">รายการบริการ</div>
                  <div className="col-span-2 text-center">จำนวน</div>
                  <div className="col-span-2 text-right">ราคาต่อหน่วย</div>
                  <div className="col-span-2 text-right">ราคารวม</div>
                </div>

                <div className="p-5 space-y-4 text-xs sm:text-sm bg-white">
                  <div>
                    <p className="font-bold text-[#7C6032] mb-1.5">แพ็กเกจที่เลือก</p>
                    <div className="grid grid-cols-12 items-center text-stone-700">
                      <div className="col-span-6">
                        • {selectedPkg.name} (สวด {selectedPkg.durationNights} คืน / แขก {selectedPkg.baseGuests} คน)
                      </div>
                      <div className="col-span-2 text-center">1 แพ็กเกจ</div>
                      <div className="col-span-2 text-right">{selectedPkg.price.toLocaleString()} บาท</div>
                      <div className="col-span-2 text-right font-semibold">{selectedPkg.price.toLocaleString()} บาท</div>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-[#7C6032] mb-1.5">รายการสั่งเพิ่มพิเศษ</p>
                    <div className="space-y-1.5 text-stone-700">
                      {extraGuestsCount > 0 && (
                        <div className="grid grid-cols-12 items-center">
                          <div className="col-span-6">• รองรับแขกผู้มาร่วมงานเพิ่ม (อาหารว่าง น้ำดื่ม เก้าอี้รับรอง)</div>
                          <div className="col-span-2 text-center">+{extraGuestsCount} คน</div>
                          <div className="col-span-2 text-right">{EXTRA_GUEST_RATE.toLocaleString()} บาท</div>
                          <div className="col-span-2 text-right font-semibold">{extraGuestsCost.toLocaleString()} บาท</div>
                        </div>
                      )}

                      {ritualUpgradePrice > 0 && (
                        <div className="grid grid-cols-12 items-center">
                          <div className="col-span-6">
                            • อัปเกรดพิธีกรรม ({ritualTypes.find(r => r.id === selectedRitualId)?.name})
                          </div>
                          <div className="col-span-2 text-center">+1 งาน</div>
                          <div className="col-span-2 text-right">{ritualUpgradePrice.toLocaleString()} บาท</div>
                          <div className="col-span-2 text-right font-semibold">{ritualUpgradePrice.toLocaleString()} บาท</div>
                        </div>
                      )}

                      {addonItemsList.length === 0 && ritualUpgradePrice === 0 && guestCount === selectedPkg.baseGuests && (
                        <p className="text-xs text-stone-400 italic">ยังไม่มีรายการสั่งเพิ่มพิเศษ</p>
                      )}

                      {addonItemsList.map(item => (
                        <div key={item.id} className="grid grid-cols-12 items-center">
                          <div className="col-span-6">• {item.name}</div>
                          <div className="col-span-2 text-center">+{item.qty} {item.unit}</div>
                          <div className="col-span-2 text-right">{item.price.toLocaleString()} บาท</div>
                          <div className="col-span-2 text-right font-semibold">{item.total.toLocaleString()} บาท</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#F5E9D6] px-5 py-3 flex items-center justify-end gap-6 border-t border-[#E6DAC3]">
                  <span className="text-xs sm:text-sm font-bold text-stone-800">ราคารวมสุทธิทั้งสิ้น:</span>
                  <span className="text-lg sm:text-xl font-bold text-[#7C6032]">
                    {netTotal.toLocaleString()} <span className="text-xs font-normal text-stone-700">บาท</span>
                  </span>
                </div>
              </div>
            </div>

            {/* พิธีกรรม (เลือกได้ 1 แบบ) */}
            <div className="pt-2">
              <h4 className="font-bold text-sm text-stone-900 mb-3">พิธีกรรม (เลือกได้ 1 แบบ)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ritualTypes.map(ritual => {
                  const isSelected = ritual.id === selectedRitualId;
                  return (
                    <div
                      key={ritual.id}
                      onClick={() => setSelectedRitualId(ritual.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition ${
                        isSelected
                          ? 'border-2 border-[#2E5A44] bg-[#F4F9F6]'
                          : 'border-stone-200 bg-white hover:border-[#B5945B]'
                      }`}
                    >
                      <p className="font-bold text-xs sm:text-sm text-stone-900 mb-2">{ritual.name}</p>
                      <ul className="text-[11px] text-stone-600 space-y-1 list-disc list-inside">
                        {ritual.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 text-sm font-semibold transition"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-2.5 rounded-xl bg-[#3D7352] hover:bg-[#2E5A44] text-white text-sm font-semibold shadow transition"
            >
              ถัดไป (เลือกวันและศาลา)
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: ตรวจสอบสถานะศาลา & ระบุกำหนดการ (ตามรูปที่ 1 + Range Calendar)
      ===================================================================== */}
      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-6">ตรวจสอบสถานะศาลา</h1>

          {step3Error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{step3Error}</span>
            </div>
          )}

          {/* เลือกวัดและศาลา */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6DAC3] shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                เลือกสถานที่ / วัดที่ต้องการจัดงาน
              </label>
              <select
                value={locationId}
                onChange={e => {
                  const nextLoc = activeLocations.find(l => l.id === e.target.value);
                  setLocationId(e.target.value);
                  if (nextLoc?.pavilions?.[0]) setPavilionId(nextLoc.pavilions[0].id);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium bg-[#FDFBF7]"
              >
                {activeLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.subdistrict})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                เลือกศาลาบำเพ็ญกุศล
              </label>
              <select
                value={pavilionId}
                onChange={e => setPavilionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium bg-[#FDFBF7]"
              >
                {activePavilions.length === 0 ? (
                  <option value="">ไม่มีศาลาที่เปิดให้บริการ</option>
                ) : (
                  activePavilions.map(pav => (
                    <option key={pav.id} value={pav.id}>
                      {pav.name} (รองรับ {pav.capacity} คน)
                    </option>
                  ))
                )}
              </select>
              {(() => {
                const selPav = activePavilions.find(p => p.id === pavilionId);
                if (selPav && guestCount > (selPav.capacity || 200)) {
                  return (
                    <p className="mt-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                      ⚠️ จำนวนแขกที่เลือก ({guestCount} คน) เกินความจุภายในศาลา ({selPav.capacity} คน) แนะนำให้เลือกศาลาใหญ่ หรือสั่งเต็นท์และโต๊ะเก้าอี้เสริมบริเวณลานหน้าศาลา
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* กล่องปฏิทิน */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-3xl mx-auto">
            <h2 className="font-bold text-lg text-stone-900 mb-3">ปฏิทินตรวจสอบคิวศาลา</h2>

            <div className="flex items-center justify-between mb-5 px-2">
              <button
                type="button"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                className="w-10 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-base sm:text-lg text-stone-900">
                {calendarMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
              </span>

              <button
                type="button"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                className="w-10 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* หัวตาราง อา. - ส. */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(day => (
                <div key={day} className="py-1 rounded-full border border-stone-300 text-xs font-bold text-stone-800">
                  {day}
                </div>
              ))}
            </div>

            {/* ตารางวันที่ */}
            <div className="grid grid-cols-7 border-t border-l border-stone-200">
              {calendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <div key={idx} className="h-20 p-2 border-r border-b border-stone-200 text-stone-300 text-sm">
                      {cell.day}
                    </div>
                  );
                }

                const isPast = cell.dateStr < todayStr;
                const status = getDateBookingStatus(cell.dateStr);
                const isSelectedRange = startDate && cremationDate && cell.dateStr >= startDate && cell.dateStr <= cremationDate;
                const isStart = cell.dateStr === startDate;
                const isEnd = cell.dateStr === cremationDate;
                const isBone = cell.dateStr === boneDate;

                return (
                  <div
                    key={idx}
                    onClick={() => !isPast && handleSelectCalendarDate(cell.dateStr)}
                    className={`h-20 p-1.5 border-r border-b border-stone-200 relative transition select-none ${
                      isPast
                        ? 'bg-stone-100/70 text-stone-400 cursor-not-allowed'
                        : status.isSelectedPavilionBooked
                        ? 'bg-red-50/60 cursor-not-allowed'
                        : isSelectedRange
                        ? 'bg-emerald-50/80 cursor-pointer'
                        : 'hover:bg-amber-50/50 cursor-pointer'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isPast ? 'text-stone-400' : isStart || isEnd ? 'font-bold text-emerald-900' : 'text-stone-800'}`}>
                      {cell.day}
                    </span>

                    {status.bookedPavilionsCount > 0 && (
                      <div
                        className={`mt-1 h-4 rounded-full px-1.5 text-[9px] font-semibold flex items-center truncate ${
                          status.isAllZonesFull
                            ? 'bg-red-200 text-red-800'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {status.isAllZonesFull ? 'เต็มทุกโซน' : `จองแล้ว ${status.bookedPavilionsCount} โซน`}
                      </div>
                    )}

                    {isSelectedRange && (
                      <div
                        className={`mt-1 h-5 bg-[#3D7352] text-white text-[9px] font-semibold flex items-center justify-center ${
                          isStart ? 'rounded-l-full' : ''
                        } ${isEnd ? 'rounded-r-full' : ''}`}
                      >
                        {isStart ? 'เริ่มงาน' : isEnd ? 'วันฌาปนกิจ' : 'สวดอภิธรรม'}
                      </div>
                    )}

                    {isBone && (
                      <div className="mt-1 h-4 rounded-full bg-amber-100 border border-amber-400 text-amber-900 text-[9px] font-semibold flex items-center justify-center">
                        เก็บอัฐิ
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* คำอธิบายสีสถานะ */}
          <div className="flex flex-wrap items-center justify-center gap-8 my-6 text-xs font-bold text-[#5C3D1E]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500 inline-block" />
              <span>ว่างพร้อมบริการ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500 inline-block" />
              <span>จองแล้วบางโซน (ยังพอมีคิว)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 inline-block" />
              <span>เต็มทุกโซน</span>
            </div>
          </div>

          {/* ระบุกำหนดการ 3 ช่อง */}
          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-base text-stone-900">ระบุกำหนดการ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">วันตั้งศพวันแรก</label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={startDate}
                    onChange={e => handleSelectCalendarDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#7C6032] bg-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">วันฌาปนกิจ</label>
                <div className="relative">
                  <input
                    type="date"
                    min={startDate || todayStr}
                    value={cremationDate}
                    onChange={e => {
                      const nextCrem = e.target.value;
                      setCremationDate(nextCrem);
                      if (nextCrem) {
                        setBoneDate(addDaysToDateStr(nextCrem, 1));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#7C6032] bg-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">วันเก็บกระดูก</label>
                <div className="relative">
                  <input
                    type="date"
                    min={cremationDate || startDate || todayStr}
                    value={boneDate}
                    onChange={e => setBoneDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#7C6032] bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 text-sm font-semibold transition"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={handleNextFromStep3}
              className="px-8 py-2.5 rounded-xl bg-[#3D7352] hover:bg-[#2E5A44] text-white text-sm font-semibold shadow transition"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 4: เลือกวิธีการชำระเงิน & นัดหมายติดต่อที่ศูนย์บริการ
      ===================================================================== */}
      {step === 4 && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-stone-900">
            เลือกวิธีการชำระเงิน & ยืนยันวันนัดหมายติดต่อศูนย์บริการ
          </h1>

          {/* ข้อกำหนดสำคัญตาม Requirement 2.2 Step 4 */}
          <div className="bg-amber-50 border-2 border-[#B5945B] rounded-2xl p-5 flex items-start gap-4">
            <Building2 className="w-7 h-7 text-[#7C6032] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm sm:text-base text-stone-900">
                ข้อกำหนดการชำระเงิน (ไม่ต้องโอนหรือแนบสลิปออนไลน์ในหน้านี้)
              </p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                “การชำระเงินทุกกรณี <strong>ต้องเดินทางไปชำระเงินกับเจ้าหน้าที่ ณ ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวก (หมู่ 8 ต.หนองหาร อ.สันทราย จ.เชียงใหม่) เท่านั้น</strong>” เพื่อตรวจสอบเอกสารสำคัญและออกใบเสร็จรับเงินอย่างเป็นทางการ
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DAC3] shadow-sm space-y-6">
            {/* สรุปข้อมูลคำขอ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-stone-200 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <p className="font-bold text-stone-900 text-base mb-2">ข้อมูลงานศพและสถานที่</p>
                <p><span className="text-stone-500">ผู้เสียชีวิต:</span> <strong>{deceased.prefix}{deceased.fullName}</strong></p>
                <p><span className="text-stone-500">ผู้ติดต่อ (เจ้าภาพ):</span> <strong>{contact.prefix}{contact.fullName} ({contact.relationship})</strong></p>
                <p><span className="text-stone-500">เบอร์โทรศัพท์:</span> {contact.phone}</p>
                <p><span className="text-stone-500">สถานที่จัดงาน:</span> <strong>{currentLocation?.name} ({currentLocation?.pavilions?.find(p => p.id === pavilionId)?.name})</strong></p>
                <p><span className="text-stone-500">กำหนดการจัดงาน:</span> {startDate} ถึง {cremationDate} (เก็บกระดูก {boneDate})</p>
              </div>

              <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E6DAC3] space-y-2">
                <p className="font-bold text-stone-900 text-base">สรุปยอดค่าใช้จ่าย</p>
                <div className="flex justify-between">
                  <span>{selectedPkg.name} (แขกตั้งต้น {selectedPkg.baseGuests} คน)</span>
                  <span className="font-semibold">{selectedPkg.price.toLocaleString()} บาท</span>
                </div>
                {extraGuestsCount > 0 && (
                  <div className="flex justify-between">
                    <span>รองรับแขกเพิ่ม (+{extraGuestsCount} คน)</span>
                    <span className="font-semibold">+{extraGuestsCost.toLocaleString()} บาท</span>
                  </div>
                )}
                {ritualUpgradePrice > 0 && (
                  <div className="flex justify-between">
                    <span>ค่าอัปเกรดพิธีกรรม</span>
                    <span className="font-semibold">+{ritualUpgradePrice.toLocaleString()} บาท</span>
                  </div>
                )}
                {addonsOnlyTotal > 0 && (
                  <div className="flex justify-between">
                    <span>บริการเสริมพิเศษ ({addonItemsList.length} รายการ)</span>
                    <span className="font-semibold">+{addonsOnlyTotal.toLocaleString()} บาท</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E6DAC3] flex justify-between text-base font-bold text-[#2E5A44]">
                  <span>ยอดรวมสุทธิทั้งสิ้น</span>
                  <span>{netTotal.toLocaleString()} บาท</span>
                </div>
              </div>
            </div>

            {/* เลือกรูปแบบการชำระเงิน 2 แบบ */}
            <div className="space-y-3">
              <h3 className="font-bold text-base text-stone-900">เลือกรูปแบบการชำระเงิน ณ ศูนย์บริการ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentOption('INSTALLMENT')}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition ${
                    paymentOption === 'INSTALLMENT'
                      ? 'border-[#2E5A44] bg-[#F4F9F6]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm sm:text-base text-stone-900">
                      1. ชำระเป็นงวด (แบ่งชำระ 2 งวด)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      นิยมเลือก
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    • <strong>งวดที่ 1 (มัดจำก่อนเริ่มงาน):</strong> ชำระในวันนัดหมายที่ศูนย์บริการ (ประมาณ 25% = <strong>{Math.round(netTotal * 0.25).toLocaleString()} บาท</strong> หรือตามตกลงกับเจ้าหน้าที่)<br />
                    • <strong>งวดที่ 2 (ส่วนที่เหลือหลังจบงาน):</strong> ชำระส่วนที่เหลือในวันจบงานที่ศูนย์บริการ
                  </p>
                </div>

                <div
                  onClick={() => setPaymentOption('FULL')}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition ${
                    paymentOption === 'FULL'
                      ? 'border-[#2E5A44] bg-[#F4F9F6]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm sm:text-base text-stone-900">
                      2. ชำระเต็มจำนวน (Full Payment 100%)
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    • ชำระยอดเต็มจำนวน 100% (<strong>{netTotal.toLocaleString()} บาท</strong>) ครั้งเดียวในวันนัดหมายติดต่อเจ้าหน้าที่ ณ ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวก
                  </p>
                </div>
              </div>
            </div>

            {/* กำหนดวันและเวลานัดหมายเข้ามาติดต่อที่ศูนย์บริการ */}
            <div className="pt-2 space-y-3">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#9B7B45]" />
                กำหนดวันและเวลานัดหมายติดต่อเจ้าหน้าที่ ณ ศูนย์บริการบ้านวิเวก
              </h3>
              {step4Error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{step4Error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    วันที่นัดหมายเข้าติดต่อศูนย์บริการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    max={startDate || undefined}
                    value={appointmentDate}
                    onChange={e => {
                      setAppointmentDate(e.target.value);
                      setStep4Error('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ช่วงเวลานัดหมาย <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={appointmentTime}
                    onChange={e => setAppointmentTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  >
                    <option value="08:30 - 09:30 น.">08:30 - 09:30 น.</option>
                    <option value="09:00 - 10:00 น.">09:00 - 10:00 น.</option>
                    <option value="10:00 - 11:00 น.">10:00 - 11:00 น.</option>
                    <option value="13:00 - 14:00 น.">13:00 - 14:00 น.</option>
                    <option value="15:00 - 16:00 น.">15:00 - 16:00 น.</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 text-sm font-semibold transition"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitBooking}
              className="px-8 py-3 rounded-xl bg-[#3D7352] hover:bg-[#2E5A44] disabled:opacity-60 text-white text-sm font-semibold shadow-lg transition"
            >
              {isSubmitting ? 'กำลังส่งคำขอจัดงาน...' : 'ยืนยันส่งข้อมูลประสงค์จัดงาน'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
