import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ClipboardList,
  Calendar as CalendarIcon,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminDashboardPage() {
  const { bookings, packages, assignments } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [packageFilter, setPackageFilter] = useState('ALL');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const pendingCount = bookings.filter(b => b.status === 'รออนุมัติ').length;
  const completedCount = bookings.filter(b => b.status === 'เสร็จสิ้น').length;
  const activeCount = bookings.filter(b => b.status === 'กำลังดำเนินงาน').length;
  const upcomingBookings = bookings
    .filter(b => b.status !== 'เสร็จสิ้น' && b.status !== 'ยกเลิก')
    .sort((a, b) => String(a.startDate || '').localeCompare(String(b.startDate || '')));

  const latestActiveBooking = bookings.find(b => b.status === 'กำลังดำเนินงาน') || upcomingBookings[0] || bookings[0];
  const latestTasks = latestActiveBooking
    ? assignments.filter(t => t.bookingId === latestActiveBooking.id)
    : [];
  const isSeqDone = (seqs) => {
    if (!latestActiveBooking) return false;
    if (latestActiveBooking.status === 'เสร็จสิ้น') return true;
    const matched = latestTasks.filter(t => seqs.includes(t.seq));
    return matched.length > 0 && matched.every(t => t.status === 'เสร็จสิ้น');
  };

  const calendarCells = React.useMemo(() => {
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

  const filteredBookings = bookings.filter(b => {
    const matchText =
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.deceased.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contact.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchPkg = packageFilter === 'ALL' || b.packageId === packageFilter || b.packageName === packageFilter;
    return matchText && matchStatus && matchPkg;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-xs text-stone-500">ภาพรวมการจัดงานทั้งหมดของวิสาหกิจชุมชนบ้านวิเวก</p>
      </div>

      {/* 4 การ์ดสรุปด้านบน */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('รออนุมัติ')}
          className="cursor-pointer rounded-2xl p-5 bg-[#FFF1EE] border border-red-100 shadow-sm hover:shadow transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-200/80 text-red-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-700">รออนุมัติ</p>
              <p className="text-2xl font-bold text-stone-900">{pendingCount}</p>
              <p className="text-[11px] text-stone-500">รายการ</p>
            </div>
          </div>
          <p className="text-xs text-stone-600 mt-3 font-medium">ดูทั้งหมด &gt;</p>
        </div>

        <div
          onClick={() => setStatusFilter('เสร็จสิ้น')}
          className="cursor-pointer rounded-2xl p-5 bg-[#F1F9EE] border border-emerald-100 shadow-sm hover:shadow transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200/80 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-700">เสร็จสิ้นทั้งหมด</p>
              <p className="text-2xl font-bold text-stone-900">{completedCount}</p>
              <p className="text-[11px] text-stone-500">รายการ</p>
            </div>
          </div>
          <p className="text-xs text-stone-600 mt-3 font-medium">ดูทั้งหมด &gt;</p>
        </div>

        <div
          onClick={() => setStatusFilter('กำลังดำเนินงาน')}
          className="cursor-pointer rounded-2xl p-5 bg-[#F2F6FF] border border-blue-100 shadow-sm hover:shadow transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-200/80 text-blue-800 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-700">กำลังดำเนินงาน</p>
              <p className="text-2xl font-bold text-stone-900">{activeCount}</p>
              <p className="text-[11px] text-stone-500">รายการ</p>
            </div>
          </div>
          <p className="text-xs text-stone-600 mt-3 font-medium">ดูทั้งหมด &gt;</p>
        </div>

        <div
          onClick={() => navigate('/admin/schedule')}
          className="cursor-pointer rounded-2xl p-5 bg-[#FBF2FF] border border-purple-100 shadow-sm hover:shadow transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-200/80 text-purple-800 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-700">งานที่กำลังจะมาถึง</p>
              <p className="text-2xl font-bold text-stone-900">{upcomingBookings.length}</p>
              <p className="text-[11px] text-stone-500">รายการ</p>
            </div>
          </div>
          <p className="text-xs text-stone-600 mt-3 font-medium">ดูทั้งหมด &gt;</p>
        </div>
      </div>

      {/* แถวกลาง: ปฏิทินตารางงาน + ความคืบหน้าของงานล่าสุด */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ปฏิทิน */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
          <h3 className="font-bold text-sm text-stone-900 mb-3">ปฏิทินตารางงาน</h3>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition"
            >
              <ChevronLeft className="w-4 h-4 text-stone-700" />
            </button>
            <span className="font-bold text-sm text-stone-900">
              {calendarMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition"
            >
              <ChevronRight className="w-4 h-4 text-stone-700" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-stone-700 mb-2">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(d => (
              <div key={d} className="py-1 rounded-full bg-stone-100">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-t border-l border-stone-200 text-xs">
            {calendarCells.map((cell, i) => {
              const matchedList = cell.dateStr
                ? bookings.filter(
                    b =>
                      b.status !== 'ยกเลิก' &&
                      cell.dateStr >= b.startDate &&
                      cell.dateStr <= (b.boneCollectionDate || b.cremationDate)
                  )
                : [];

              return (
                <div key={i} className="min-h-[70px] p-1 border-r border-b border-stone-200 relative space-y-0.5">
                  <span className={cell.isCurrentMonth ? 'text-stone-800 font-medium' : 'text-stone-300'}>
                    {cell.day}
                  </span>
                  {matchedList.slice(0, 2).map(matched => (
                    <div
                      key={matched.id}
                      onClick={() => navigate(`/admin/requests/${matched.id}`)}
                      className={`px-1 py-0.5 rounded text-[10px] font-semibold truncate cursor-pointer ${
                        matched.status === 'เสร็จสิ้น'
                          ? 'bg-emerald-100 text-emerald-800'
                          : matched.status === 'กำลังดำเนินงาน'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                      title={`${matched.code} ${matched.deceased.prefix}${matched.deceased.fullName} (${matched.pavilionName})`}
                    >
                      {matched.deceased.prefix}{matched.deceased.fullName}
                    </div>
                  ))}
                  {matchedList.length > 2 && (
                    <div className="text-[9px] text-stone-500 font-semibold px-1">
                      +{matchedList.length - 2} งาน
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-6 mt-4 text-[11px] text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-300" /> กำลังดำเนินงาน
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" /> เสร็จสิ้น
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300" /> รออนุมัติ
            </span>
          </div>
        </div>

        {/* ความคืบหน้าของงานล่าสุด (อิงข้อมูลแผนกจริง) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-stone-900">ความคืบหน้าของงานล่าสุด</h3>
              {latestActiveBooking && (
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  {latestActiveBooking.status}
                </span>
              )}
            </div>

            {latestActiveBooking ? (
              <>
                <p className="font-bold text-sm text-stone-800">
                  งานที่ {latestActiveBooking.code} {latestActiveBooking.deceased.prefix}{latestActiveBooking.deceased.fullName}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  วันที่จัดงาน {latestActiveBooking.startDate} | {latestActiveBooking.locationName} ({latestActiveBooking.pavilionName})
                </p>

                <div className="mt-5 space-y-3 text-xs">
                  {[
                    { label: '1. รับคำขอจัดงานและตรวจสอบเอกสาร', done: latestActiveBooking.status !== 'ยกเลิก' },
                    { label: '2. ยืนยันการชำระเงินและอนุมัติงาน', done: latestActiveBooking.installment1Paid && latestActiveBooking.status !== 'รออนุมัติ' },
                    { label: '3. จัดเตรียมสถานที่ เครื่องเสียง และไฟฟ้า', done: isSeqDone([1, 5]) },
                    { label: '4. เคลื่อนย้ายร่างและเตรียมหีบศพ/โลงเย็น', done: isSeqDone([2, 3]) },
                    { label: '5. จัดดอกไม้ ตกแต่ง และหัตถกรรมของชำร่วย', done: isSeqDone([4, 7]) },
                    { label: '6. บริการอาหาร น้ำดื่ม และโรงครัว', done: isSeqDone([6]) },
                    { label: '7. ดำเนินพิธีการและสวดพระอภิธรรม', done: isSeqDone([8]) },
                    { label: '8. ปิดจบงานบริบูรณ์', done: latestActiveBooking.status === 'เสร็จสิ้น' }
                  ].map((st, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          st.done ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        ✓
                      </span>
                      <span className={st.done ? 'font-semibold text-stone-800' : 'text-stone-500'}>
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-stone-400 py-8 text-center">ยังไม่มีรายการงานในระบบ</p>
            )}
          </div>

          {latestActiveBooking && (
            <Link
              to={`/admin/assignments/${latestActiveBooking.id}`}
              className="mt-6 block w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-center text-xs font-semibold text-stone-800 transition"
            >
              ดูรายละเอียดงานและมอบหมายงานทั้งหมด &gt;
            </Link>
          )}
        </div>
      </div>

      {/* งานที่กำลังจะมาถึง (เรียงตามวันเริ่มงาน) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-stone-900">งานที่กำลังจะมาถึง</h3>
        <div className="space-y-3">
          {upcomingBookings.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">ไม่มีรายการงานที่กำลังจะมาถึง</p>
          ) : (
            upcomingBookings.slice(0, 3).map(b => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4 hover:bg-stone-50/70"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-stone-900">
                      {b.deceased.prefix}{b.deceased.fullName} (เจ้าภาพ: {b.contact.prefix}{b.contact.fullName})
                    </p>
                    <p className="text-xs text-stone-500">{b.locationName} ({b.pavilionName})</p>
                  </div>
                </div>

                <div className="text-xs text-stone-700">
                  <p className="font-semibold">วันเริ่มงาน: {b.startDate}</p>
                  <p className="text-stone-400">นัดชำระศูนย์บริการ: {b.appointmentDate} ({b.appointmentTime})</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === 'รออนุมัติ'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {b.status}
                  </span>
                  <Link
                    to={`/admin/requests/${b.id}`}
                    className="px-4 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-800"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ตารางรายการทั้งหมด พร้อมตัวกรอง */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-bold text-base text-stone-900">รายการทั้งหมด ({filteredBookings.length})</h3>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="ค้นหาเลขงาน / ชื่อผู้เสียชีวิต / ผู้ติดต่อ"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-stone-300 text-xs focus:outline-none focus:border-[#9B7B45]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-2.5" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="รออนุมัติ">รออนุมัติ</option>
            <option value="กำลังดำเนินงาน">กำลังดำเนินงาน</option>
            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            <option value="ยกเลิก">ยกเลิก</option>
          </select>

          <select
            value={packageFilter}
            onChange={e => setPackageFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
          >
            <option value="ALL">แพ็กเกจทั้งหมด</option>
            {packages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setPackageFilter('ALL');
            }}
            className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-600"
          >
            ล้างตัวกรอง
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                <th className="py-3 px-3">เลขงาน</th>
                <th className="py-3 px-3">รหัสคำขอ</th>
                <th className="py-3 px-3">ผู้เสียชีวิต</th>
                <th className="py-3 px-3">ผู้ติดต่อ</th>
                <th className="py-3 px-3">วันที่จัดงาน</th>
                <th className="py-3 px-3">สถานที่</th>
                <th className="py-3 px-3">แพ็กเกจ</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBookings.map(b => (
                <tr key={b.id} className="hover:bg-stone-50">
                  <td className="py-3.5 px-3 font-bold text-stone-800">{b.code}</td>
                  <td className="py-3.5 px-3 text-stone-600">{b.id}</td>
                  <td className="py-3.5 px-3 font-medium text-stone-900">
                    {b.deceased.prefix}{b.deceased.fullName}
                  </td>
                  <td className="py-3.5 px-3 text-stone-700">
                    {b.contact.prefix}{b.contact.fullName}
                  </td>
                  <td className="py-3.5 px-3 text-stone-600">{b.startDate}</td>
                  <td className="py-3.5 px-3 text-stone-600">{b.locationName}</td>
                  <td className="py-3.5 px-3 text-stone-700">{b.packageName}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-semibold ${
                        b.status === 'รออนุมัติ'
                          ? 'bg-amber-100 text-amber-800'
                          : b.status === 'กำลังดำเนินงาน'
                          ? 'bg-blue-100 text-blue-700'
                          : b.status === 'ยกเลิก'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to={`/admin/requests/${b.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      ตรวจสอบ
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
