import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Camera,
  Trash2,
  Eye,
  AlertCircle,
  UserCircle2,
  Clock,
  MapPin,
  Phone,
  Check,
  Sparkles
} from 'lucide-react';
import { useApp, fileToDataUrl } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { normalizeDepartmentName } from '../../config/siteConfig';

const THAI_WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function getDaysUntilText(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '-';
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'วันนี้';
  if (diffDays === 1) return 'พรุ่งนี้';
  if (diffDays > 1) return `อีก ${diffDays} วัน`;
  if (diffDays === -1) return 'เมื่อวาน';
  return `ผ่านมา ${Math.abs(diffDays)} วัน`;
}

export function DepartmentDashboardPage() {
  const { bookings, assignments } = useApp();
  const { user } = useAuth();
  const currentDept = normalizeDepartmentName(user?.department || 'ฝ่ายสถานที่');

  const bookingMap = useMemo(() => {
    const map = new Map();
    bookings.forEach(b => map.set(b.id, b));
    return map;
  }, [bookings]);

  const deptTasks = useMemo(
    () =>
      assignments.filter(t => {
        if (normalizeDepartmentName(t.department) !== currentDept) return false;
        const parent = bookingMap.get(t.bookingId);
        if (parent && (parent.status === 'รออนุมัติ' || parent.status === 'ยกเลิก')) return false;
        return t.status !== 'ยกเลิก';
      }),
    [assignments, currentDept, bookingMap]
  );

  const upcomingTasks = useMemo(
    () =>
      [...deptTasks]
        .filter(t => t.status !== 'เสร็จสิ้น')
        .sort((a, b) => String(a.workDate || '').localeCompare(String(b.workDate || ''))),
    [deptTasks]
  );

  const [selectedTaskTab, setSelectedTaskTab] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    setSelectedTaskTab(0);
  }, [currentDept]);

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, muted: true, dateStr: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        day: d,
        muted: false,
        dateStr: `${year}-${mStr}-${dStr}`
      });
    }
    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextDay++, muted: true, dateStr: null });
    }
    return cells;
  }, [calendarMonth]);

  const activeTask = deptTasks[selectedTaskTab] || deptTasks[0] || null;
  const checkedCount = activeTask
    ? (activeTask.checklist || []).filter(c => c.isChecked).length
    : 0;
  const totalCheckCount = activeTask ? (activeTask.checklist || []).length : 0;
  const hasPhoto = (activeTask?.photos?.length || 0) > 0;

  const progressSteps = activeTask
    ? [
        { label: 'รับคำขอจัดงาน', done: true },
        { label: 'ตรวจสอบข้อมูล', done: true },
        { label: 'ยืนยันการทำงาน', done: activeTask.status !== 'ยังไม่ได้มอบหมาย' },
        { label: 'จัดเตรียมอุปกรณ์', done: checkedCount >= 1 },
        { label: 'จัดเตรียมสถานที่', done: totalCheckCount > 0 && checkedCount >= Math.ceil(totalCheckCount / 2) },
        { label: 'ตรวจสอบหน้างาน', done: totalCheckCount > 0 && checkedCount === totalCheckCount },
        { label: 'ส่งมอบงาน', done: hasPhoto && totalCheckCount > 0 && checkedCount === totalCheckCount },
        { label: 'งานเสร็จสิ้น', done: activeTask.status === 'เสร็จสิ้น' }
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900">แดชบอร์ด ({currentDept})</h1>
        <Link
          to="/department/assignments"
          className="px-4 py-2 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-xs font-semibold shadow-sm"
        >
          ไปที่งานที่ได้รับมอบหมาย ({upcomingTasks.length} งาน) →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ซ้าย: ปฏิทิน + งานที่ใกล้จะถึง */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-800 text-base">ปฏิทินงานของแผนก</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-stone-800 min-w-[130px] text-center">
                  {calendarMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {THAI_WEEKDAYS.map(d => (
                <div key={d} className="py-1 rounded-full border border-stone-300 text-xs font-semibold text-stone-700">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 border-t border-l border-stone-200 text-xs">
              {calendarCells.map((cell, idx) => {
                const matchedTasks = cell.dateStr
                  ? deptTasks.filter(t => {
                      const b = bookingMap.get(t.bookingId);
                      if (!b || b.status === 'ยกเลิก' || b.status === 'รออนุมัติ') return false;
                      return cell.dateStr >= b.startDate && cell.dateStr <= b.cremationDate;
                    })
                  : [];

                return (
                  <div
                    key={idx}
                    className={`min-h-[72px] border-r border-b border-stone-200 p-1.5 flex flex-col gap-1 ${
                      cell.muted ? 'bg-stone-50/60 text-stone-400' : 'bg-white text-stone-800'
                    }`}
                  >
                    <span className="font-semibold">{cell.day}</span>
                    {matchedTasks.slice(0, 2).map(matchedTask => {
                      const badgeColor =
                        matchedTask.status === 'เสร็จสิ้น'
                          ? 'bg-emerald-100 text-emerald-900'
                          : matchedTask.status === 'กำลังดำเนินงาน'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900';
                      return (
                        <span
                          key={matchedTask.id}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate ${badgeColor}`}
                          title={`${matchedTask.deceasedName} - ${matchedTask.title}`}
                        >
                          {matchedTask.deceasedName || matchedTask.bookingCode}
                        </span>
                      );
                    })}
                    {matchedTasks.length > 2 && (
                      <span className="text-[10px] font-bold text-stone-500">
                        +{matchedTasks.length - 2} งาน
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-stone-600">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-200 inline-block" />
                กำลังดำเนินพิธี
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-200 inline-block" />
                พิธีเสร็จสิ้น
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-200 inline-block" />
                รอดำเนินงาน
              </span>
            </div>
          </div>

          {/* งานที่ใกล้จะถึง */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <h3 className="font-bold text-stone-800 text-sm mb-4">งานที่ใกล้จะถึง</h3>
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                ไม่มีงานค้างที่ใกล้ถึงกำหนดสำหรับ {currentDept}
              </p>
            ) : (
              <div className="divide-y divide-stone-200">
                {upcomingTasks.slice(0, 3).map(t => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{t.deceasedName}</p>
                        <p className="text-xs text-stone-500">
                          {t.title} • {t.workDate}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-[#FDF6DF] text-amber-900 text-xs font-semibold shrink-0">
                      {getDaysUntilText(t.workDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ขวา: สรุปภาพรวมแผนก + ความคืบหน้าของงานล่าสุด */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <h3 className="font-bold text-stone-800 text-sm mb-4">สรุปภาพรวมงานของแผนก</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#EFE3FA] border border-purple-200 p-4 text-center flex flex-col items-center">
                <CalendarIcon className="w-8 h-8 text-stone-800 mb-2" />
                <p className="text-xs font-bold text-stone-800">งานค้างดำเนินการ</p>
                <p className="text-base font-extrabold text-stone-900 mt-1">
                  {upcomingTasks.length} งาน
                </p>
              </div>
              <div className="rounded-2xl bg-[#FFF2CC] border border-amber-200 p-4 text-center flex flex-col items-center">
                <Clock className="w-8 h-8 text-stone-800 mb-2" />
                <p className="text-xs font-bold text-stone-800">วันงานที่ใกล้ที่สุด</p>
                <p className="text-xs font-extrabold text-stone-900 mt-1">
                  {upcomingTasks[0]?.workDate || 'ยังไม่มีกำหนดการ'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <h3 className="font-bold text-stone-800 text-sm mb-3">ความคืบหน้าของงานล่าสุด</h3>

            {!activeTask ? (
              <div className="bg-stone-50 rounded-2xl p-6 text-center text-xs text-stone-500">
                ยังไม่มีงานที่ได้รับมอบหมายสำหรับ {currentDept} ในขณะนี้
              </div>
            ) : (
              <>
                {/* Tabs งานที่ 1, งานที่ 2 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {deptTasks.slice(0, 3).map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTaskTab(idx)}
                      className={`px-4 py-1.5 rounded-t-xl text-xs font-bold transition ${
                        selectedTaskTab === idx
                          ? 'bg-[#EAEAEA] text-stone-900'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      งานที่ {idx + 1} ({t.bookingCode})
                    </button>
                  ))}
                </div>

                <div className="bg-[#EAEAEA] rounded-2xl rounded-tl-none p-5">
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <div>
                      <p className="text-sm font-bold text-stone-900">{activeTask.deceasedName}</p>
                      <p className="text-[11px] text-stone-600">{activeTask.title}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-800 text-xs font-semibold shrink-0">
                      {activeTask.status}
                    </span>
                  </div>

                  <div className="space-y-3 pl-2">
                    {progressSteps.map((step, i) => (
                      <div key={step.label} className="flex items-center gap-3 relative">
                        {i < progressSteps.length - 1 && (
                          <div
                            className={`absolute left-[11px] top-6 w-0.5 h-5 ${
                              step.done ? 'bg-emerald-500' : 'bg-stone-300'
                            }`}
                          />
                        )}
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold z-10 ${
                            step.done
                              ? 'bg-emerald-500 text-white'
                              : 'bg-stone-200 text-stone-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            step.done ? 'text-stone-900' : 'text-stone-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DepartmentAssignmentsPage() {
  const {
    bookings,
    assignments,
    acceptDepartmentTask,
    toggleTaskChecklist,
    updateTaskPhotosAndNote,
    completeDepartmentTask,
    setPreviewImageModal
  } = useApp();
  const { user } = useAuth();
  const currentDept = normalizeDepartmentName(user?.department || 'ฝ่ายสถานที่');

  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const bookingMap = useMemo(() => {
    const map = new Map();
    bookings.forEach(b => map.set(b.id, b));
    return map;
  }, [bookings]);

  const deptTasks = useMemo(() => {
    return assignments.filter(t => {
      if (normalizeDepartmentName(t.department) !== currentDept) return false;
      const parent = bookingMap.get(t.bookingId);
      if (parent && (parent.status === 'รออนุมัติ' || parent.status === 'ยกเลิก')) return false;
      if (t.status === 'ยกเลิก' || t.status === 'เสร็จสิ้น') return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (t.deceasedName || '').toLowerCase().includes(q) ||
        (t.bookingCode || '').toLowerCase().includes(q) ||
        (t.hostName || '').toLowerCase().includes(q) ||
        (t.title || '').toLowerCase().includes(q)
      );
    });
  }, [assignments, currentDept, search, bookingMap]);

  const selectedTask = useMemo(() => {
    if (selectedTaskId) {
      const found = deptTasks.find(t => t.id === selectedTaskId);
      if (found) return found;
    }
    return deptTasks[0] || null;
  }, [deptTasks, selectedTaskId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const isTaskDone = selectedTask?.status === 'เสร็จสิ้น';

  const handlePhotoUpload = async (e, slotIdx) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask || isTaskDone) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const currentPhotos = [...(selectedTask.photos || [])];
      if (slotIdx < currentPhotos.length) {
        currentPhotos[slotIdx] = dataUrl;
      } else {
        currentPhotos.push(dataUrl);
      }
      updateTaskPhotosAndNote(selectedTask.id, { photos: currentPhotos });
      showToast('แนบรูปภาพหน้างานเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error reading photo:', err);
    }
  };

  const handleRemovePhoto = (slotIdx) => {
    if (!selectedTask || isTaskDone) return;
    const nextPhotos = (selectedTask.photos || []).filter((_, i) => i !== slotIdx);
    updateTaskPhotosAndNote(selectedTask.id, { photos: nextPhotos });
  };

  // เงื่อนไขบังคับ (Gatekeeper): เช็กลิสต์ต้องติ๊กครบ 100% และมีรูปหน้างานอย่างน้อย 1 รูป
  const totalChecklist = selectedTask?.checklist?.length || 0;
  const completedChecklist = selectedTask?.checklist?.filter(c => c.isChecked).length || 0;
  const isAllChecked = totalChecklist > 0 && completedChecklist === totalChecklist;
  const uploadedPhotoCount = selectedTask?.photos?.length || 0;
  const hasAtLeastOnePhoto = uploadedPhotoCount >= 1;
  const canCompleteTask = isAllChecked && hasAtLeastOnePhoto && !isTaskDone;

  const getBadgeStyle = (status) => {
    if (status === 'กำลังดำเนินงาน') return 'bg-[#3D8B5E] text-white';
    if (status === 'เสร็จสิ้น') return 'bg-stone-300 text-stone-700';
    return 'bg-[#FBF3C7] text-stone-800';
  };

  const getStatusLabel = (status) => {
    if (status === 'กำลังดำเนินงาน') return 'กำลังดำเนินงาน';
    if (status === 'เสร็จสิ้น') return 'เสร็จสิ้น';
    return 'รอดำเนินงาน';
  };

  return (
    <div className="space-y-5">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2E5A44] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header + Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">งานที่ได้รับมอบหมาย ({currentDept})</h1>
          <p className="text-xs text-stone-500">
            แสดงเฉพาะงานที่กำลังดำเนินงาน/รอดำเนินงาน (งานที่เสร็จสิ้นแล้วจะย้ายไปแสดงที่เมนู &ldquo;ประวัติการดำเนินงาน&rdquo;)
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัสงาน, ชื่อผู้เสียชีวิต, เจ้าภาพ..."
            className="w-full pl-4 pr-10 py-2 rounded-full border border-stone-300 bg-white text-sm focus:outline-none focus:border-stone-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-2.5" />
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* รายการการ์ดงานด้านซ้าย */}
        <div className="lg:col-span-6 space-y-4">
          {deptTasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-3">
              <p className="text-stone-500 text-sm">
                ไม่มีงานที่กำลังดำเนินงานสำหรับ {currentDept} ในขณะนี้
              </p>
              <Link
                to="/department/history"
                className="inline-block px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
              >
                ดูงานที่เสร็จสิ้นแล้วในประวัติการดำเนินงาน →
              </Link>
            </div>
          ) : (
            deptTasks.map(task => {
              const isSelected = selectedTask?.id === task.id;
              const taskDoneCount = (task.checklist || []).filter(c => c.isChecked).length;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`bg-white rounded-3xl border p-5 transition cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-[#2E5A44] ring-2 ring-[#2E5A44]/20'
                      : 'border-stone-300 hover:border-stone-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex flex-col items-center">
                        <UserCircle2 className="w-10 h-10 text-stone-700 stroke-[1.5]" />
                        <span className="text-xs font-bold text-stone-800 mt-1">{task.bookingCode}</span>
                      </div>

                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getBadgeStyle(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="font-bold text-stone-900 text-sm">
                          งานศพ {task.deceasedName}
                        </h3>
                        <p className="text-xs font-medium text-[#2E5A44]">
                          ภารกิจ: {task.title}
                        </p>
                        <p className="text-xs text-stone-600">ชื่อเจ้าภาพ : {task.hostName}</p>
                        <p className="text-xs text-stone-600">สถานที่ : {task.locationName}</p>
                        <p className="text-xs text-stone-600 flex items-center gap-1 pt-0.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
                          <span>{task.dateRangeText}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-2 ml-auto">
                      <div className="text-right text-[11px] text-stone-600">
                        <p>วันงาน {task.workDate}</p>
                        <p>เวลา : {task.workTime}</p>
                        <p className="text-stone-500 mt-0.5">
                          เช็กลิสต์ {taskDoneCount}/{(task.checklist || []).length} • รูป {task.photos?.length || 0}/5
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTaskId(task.id);
                        }}
                        className={`px-5 py-1.5 rounded-lg text-xs font-bold transition ${
                          task.status === 'กำลังดำเนินงาน'
                            ? 'bg-[#3D8B5E] text-white'
                            : task.status === 'เสร็จสิ้น'
                            ? 'bg-stone-300 text-stone-700'
                            : 'bg-[#FBF3C7] text-stone-800'
                        }`}
                      >
                        รายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* แผงรายละเอียดงาน + เช็กลิสต์ + แนบรูป 5 ช่อง ด้านขวา */}
        <div className="lg:col-span-6">
          {selectedTask ? (
            <div className="bg-white rounded-3xl border border-stone-300 p-6 shadow-sm space-y-5 sticky top-6">
              <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-800 text-xs font-bold">
                      {selectedTask.bookingCode} (#{selectedTask.bookingId})
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getBadgeStyle(selectedTask.status)}`}>
                      {getStatusLabel(selectedTask.status)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 pt-1">
                    งานศพ {selectedTask.deceasedName}
                  </h2>
                  <p className="text-sm font-semibold text-[#2E5A44]">
                    ใบงานแผนก: {selectedTask.title} ({selectedTask.department})
                  </p>
                  <p className="text-xs text-stone-700 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    <span>สถานที่ : {selectedTask.locationName}</span>
                  </p>
                  <p className="text-xs text-stone-700">
                    ช่วงวันจัดงาน : {selectedTask.dateRangeText}
                  </p>
                  <p className="text-xs text-stone-700">
                    วันงาน : {selectedTask.workDate} &nbsp;&nbsp; เวลา : {selectedTask.workTime}
                  </p>
                  <p className="text-xs text-stone-700">
                    ผู้ประสานงาน : {selectedTask.hostName} (เจ้าภาพ)
                  </p>
                  <p className="text-xs text-stone-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span>เบอร์โทร : {selectedTask.hostPhone}</span>
                  </p>
                </div>

                {selectedTask.status === 'มอบหมายแล้ว' || selectedTask.status === 'ยังไม่ได้มอบหมาย' ? (
                  <button
                    onClick={() => {
                      acceptDepartmentTask(selectedTask.id);
                      showToast('กดรับงานเรียบร้อยแล้ว เริ่มทำเช็กลิสต์ได้เลย');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shrink-0"
                  >
                    กดรับงานทันที
                  </button>
                ) : null}
              </div>

              {/* ขั้นตอนการทำงาน (4-Step Horizontal Stepper) */}
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-3">ขั้นตอนการทำงาน</h3>
                <div className="flex items-start justify-between relative px-2">
                  {[
                    {
                      step: 1,
                      label: 'รับงาน',
                      sub:
                        selectedTask.acceptedAt ||
                        (selectedTask.status === 'กำลังดำเนินงาน' || isTaskDone ? 'รับงานแล้ว' : 'รอรับงาน')
                    },
                    { step: 2, label: 'กำลังดำเนินงาน', sub: `${completedChecklist}/${totalChecklist} รายการ` },
                    { step: 3, label: 'ตรวจสอบ', sub: isAllChecked ? 'เช็กลิสต์ครบ' : 'รอเช็กลิสต์' },
                    { step: 4, label: 'เสร็จสิ้น', sub: selectedTask.completedAt || '' }
                  ].map((s, idx) => {
                    const currentStep = isTaskDone
                      ? 4
                      : isAllChecked
                      ? 3
                      : selectedTask.status === 'กำลังดำเนินงาน'
                      ? 2
                      : 1;
                    const isCompleted = s.step < currentStep || isTaskDone;
                    const isCurrent = s.step === currentStep && !isTaskDone;

                    return (
                      <div key={s.step} className="flex-1 flex flex-col items-center text-center relative">
                        {idx < 3 && (
                          <div
                            className={`
                              absolute top-3.5 left-1/2 w-full h-0.5
                              ${isCompleted ? 'bg-[#3D8B5E]' : 'bg-stone-300'}
                            `}
                          />
                        )}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center z-10 border-2 ${
                            isCompleted
                              ? 'bg-[#3D8B5E] border-[#3D8B5E] text-white'
                              : isCurrent
                              ? 'bg-white border-[#3D8B5E] text-[#3D8B5E]'
                              : 'bg-white border-stone-300 text-stone-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-current" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-stone-800 mt-1.5">{s.label}</p>
                        {s.sub && <p className="text-[10px] text-stone-500">{s.sub}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* รายการ Checklist */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    เช็กลิสต์สิ่งที่ต้องปฏิบัติ ({completedChecklist}/{totalChecklist})
                  </span>
                  {isAllChecked ? (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ติ๊กครบ 100% แล้ว
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-medium">
                      * ต้องติ๊กให้ครบทุกรายการ
                    </span>
                  )}
                </div>

                <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  {(selectedTask.checklist || []).map(item => (
                    <label
                      key={item.id}
                      className={`flex items-center justify-between gap-3 py-1.5 px-2 rounded-xl transition ${
                        isTaskDone ? 'cursor-default opacity-80' : 'hover:bg-white cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          disabled={isTaskDone}
                          checked={item.isChecked}
                          onChange={() => {
                            if (!isTaskDone) toggleTaskChecklist(selectedTask.id, item.id);
                          }}
                          className="w-4 h-4 rounded border-stone-400 text-[#2E5A44] focus:ring-[#2E5A44] disabled:cursor-not-allowed"
                        />
                        <span
                          className={`text-xs font-medium ${
                            item.isChecked ? 'line-through text-stone-400' : 'text-stone-800'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.completedTime && (
                        <span className="text-[10px] text-emerald-700 font-medium">
                          ✓ {item.completedTime}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* หมายเหตุจากแอดมิน + บันทึกเพิ่มเติมหน้างาน */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-900">หมายเหตุ</h4>
                {selectedTask.note && (
                  <div className="text-xs text-stone-700 bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-1">
                    {selectedTask.note.split('\n').map((line, i) => (
                      <p key={i}>+ {line}</p>
                    ))}
                  </div>
                )}
                <textarea
                  rows={2}
                  disabled={isTaskDone}
                  value={selectedTask.fieldNote || ''}
                  onChange={(e) => {
                    if (!isTaskDone) {
                      updateTaskPhotosAndNote(selectedTask.id, { fieldNote: e.target.value });
                    }
                  }}
                  placeholder={isTaskDone ? 'งานเสร็จสิ้นแล้ว (ล็อกการแก้ไข)' : 'ระบุบันทึกเพิ่มเติมจากหน้างาน (ถ้ามี)...'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-500 disabled:bg-stone-100 disabled:text-stone-500"
                />
              </div>

              {/* รูปภาพความคืบหน้า (5 ช่อง) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900">
                    รูปภาพความคืบหน้า ({uploadedPhotoCount}/5 รูป)
                  </h4>
                  {hasAtLeastOnePhoto ? (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> แนบรูปหน้างานแล้ว
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-600 font-semibold">
                      * ต้องแนบอย่างน้อย 1 รูป
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2.5">
                  {[0, 1, 2, 3, 4].map(slotIdx => {
                    const photoUrl = selectedTask.photos?.[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        className="relative aspect-square rounded-2xl bg-[#D9D9D9] border border-stone-300 overflow-hidden flex items-center justify-center group"
                      >
                        {photoUrl ? (
                          <>
                            <img
                              src={photoUrl}
                              alt={`รูปหน้างาน ${slotIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImageModal({
                                    title: `รูปหน้างาน ${selectedTask.title} (#${slotIdx + 1})`,
                                    url: photoUrl
                                  })
                                }
                                className="p-1.5 rounded-full bg-white text-stone-800 hover:bg-amber-100"
                                title="ดูรูปขยาย"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {!isTaskDone && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(slotIdx)}
                                  className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700"
                                  title="ลบรูป"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </>
                        ) : isTaskDone ? (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-[10px] text-stone-400">
                            ว่าง
                          </div>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-stone-300/70 transition text-stone-600">
                            <Camera className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-semibold">+ แนบรูป</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handlePhotoUpload(e, slotIdx)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* แจ้งเตือนเงื่อนไขก่อนกดยืนยันงานเสร็จสิ้น */}
              {!isTaskDone && (!isAllChecked || !hasAtLeastOnePhoto) && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">เงื่อนไขก่อนกดยืนยัน &ldquo;งานเสร็จสิ้น&rdquo;:</p>
                    <p>
                      1) ติ๊กเช็กลิสต์ให้ครบทุกรายการ ({completedChecklist}/{totalChecklist}) และ
                      2) ถ่ายหรือแนบรูปหน้างานอย่างน้อย 1 รูป ({uploadedPhotoCount} รูป)
                    </p>
                  </div>
                </div>
              )}

              {/* ปุ่มยืนยันงานเสร็จสิ้น (เช็กลิสต์ หมายเหตุ และรูปภาพบันทึกอัตโนมัติ) */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={!canCompleteTask}
                  onClick={() => {
                    if (!canCompleteTask) return;
                    completeDepartmentTask(selectedTask.id);
                    showToast(`ยืนยันการเสร็จสิ้นงาน "${selectedTask.title}" แล้ว (ย้ายไปที่ประวัติการดำเนินงาน)`);
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition ${
                    isTaskDone
                      ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                      : canCompleteTask
                      ? 'bg-[#3D8B5E] hover:bg-[#2E6E49] text-white shadow-md'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {isTaskDone ? '✓ งานเสร็จสิ้นแล้ว' : 'ยืนยันงานเสร็จสิ้น'}
                </button>
                <p className="text-[11px] text-center text-stone-400">
                  ระบบบันทึกเช็กลิสต์ หมายเหตุ และรูปภาพหน้างานให้อัตโนมัติทันที
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center text-stone-500 text-sm">
              {deptTasks.length === 0
                ? 'ขณะนี้ไม่มีงานค้างดำเนินการ สามารถดูงานที่เสร็จแล้วได้ที่เมนู "ประวัติการดำเนินงาน"'
                : 'กรุณาเลือกรายการงานจากด้านซ้าย'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DepartmentHistoryPage() {
  const { assignments, setPreviewImageModal } = useApp();
  const { user } = useAuth();
  const currentDept = normalizeDepartmentName(user?.department || 'ฝ่ายสถานที่');

  const completedTasks = assignments.filter(
    t => normalizeDepartmentName(t.department) === currentDept && t.status === 'เสร็จสิ้น'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">
          ประวัติการดำเนินงาน ({currentDept})
        </h1>
        <p className="text-xs text-stone-500">
          รายการงานของแผนกที่ทำเช็กลิสต์ครบ 100% และส่งมอบรูปหน้างานเสร็จสมบูรณ์แล้ว
        </p>
      </div>

      {completedTasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
          <p className="text-stone-500 text-sm">
            ยังไม่มีงานที่สถานะ &ldquo;เสร็จสิ้น&rdquo; สำหรับ {currentDept}
          </p>
          <Link
            to="/department/assignments"
            className="inline-block px-4 py-2 rounded-xl bg-[#2E5A44] text-white text-xs font-bold"
          >
            ไปที่งานที่ได้รับมอบหมาย
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {completedTasks.map(task => {
            const totalChk = (task.checklist || []).length;
            const checkedChk = (task.checklist || []).filter(c => c.isChecked).length;
            return (
              <div
                key={task.id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex flex-col items-center justify-center font-bold text-xs">
                    <span>{task.bookingCode}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-sm">
                        งานศพ {task.deceasedName} — {task.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        เสร็จสิ้น
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">
                      เจ้าภาพ: {task.hostName} • สถานที่: {task.locationName}
                    </p>
                    <p className="text-xs text-stone-500">
                      ส่งมอบเมื่อ: {task.completedAt || task.workDate} • เช็กลิสต์ {checkedChk}/{totalChk} รายการ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(task.photos || []).map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        setPreviewImageModal({
                          title: `รูปส่งมอบงาน ${task.title} (#${idx + 1})`,
                          url: photo
                        })
                      }
                      className="w-12 h-12 rounded-xl overflow-hidden border border-stone-300 hover:ring-2 hover:ring-amber-500 transition"
                    >
                      <img src={photo} alt="หลักฐานหน้างาน" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
