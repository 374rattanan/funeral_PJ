import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  UserCircle2,
  MessageCircle,
  Eye,
  CheckCircle2,
  Wrench,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminAssignmentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    bookings,
    assignments,
    departments,
    staff,
    assignTaskToStaff,
    setPreviewImageModal
  } = useApp();
  const { loginAsDepartment } = useAuth();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'UNASSIGNED' | 'ASSIGNED' | 'COMPLETED'

  // หากไม่ได้ระบุ :id จะแสดงหน้ารวมรายการงานที่ต้องมอบหมาย (ตามรูปที่ 1 ของ Admin)
  if (!id) {
    const filteredBookings = bookings.filter(
      b =>
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.deceased.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-stone-900">รายการทั้งหมด</h1>
          <div className="relative w-72">
            <input
              type="text"
              placeholder="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-4 pr-9 py-2 rounded-full border border-stone-300 bg-white text-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-2.5" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredBookings.map(b => {
            const bTasks = assignments.filter(t => t.bookingId === b.id);
            const unassignedCount = bTasks.filter(t => t.status === 'ยังไม่ได้มอบหมาย').length;
            const doneCount = bTasks.filter(t => t.status === 'เสร็จสิ้น').length;

            return (
              <div
                key={b.id}
                onClick={() => navigate(`/admin/assignments/${b.id}`)}
                className="cursor-pointer bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <UserCircle2 className="w-10 h-10 text-stone-700" />
                  <span className="font-bold text-sm text-stone-900 w-16">{b.code}</span>
                  <div>
                    <p className="text-xs text-stone-400">ผู้เสียชีวิต</p>
                    <p className="text-sm font-semibold text-stone-800">
                      {b.deceased.prefix}{b.deceased.fullName}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-stone-400">ผู้ติดต่อ</p>
                  <p className="text-sm text-stone-700">{b.contact.prefix}{b.contact.fullName}</p>
                </div>

                <div>
                  <p className="text-xs text-stone-400">วันเริ่มงาน</p>
                  <p className="text-sm text-stone-700">{b.startDate}</p>
                </div>

                <div>
                  <p className="text-xs text-stone-400">แพ็กเกจ</p>
                  <p className="text-sm font-medium text-stone-800">{b.packageName}</p>
                </div>

                <div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      doneCount === bTasks.length && bTasks.length > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : unassignedCount > 0
                        ? 'bg-[#FDF0D5] text-[#8C6223]'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {doneCount === bTasks.length && bTasks.length > 0
                      ? 'เสร็จสิ้นครบทุกแผนก'
                      : unassignedCount > 0
                      ? `รอมอบหมายงาน (${unassignedCount})`
                      : `มอบหมายแล้ว (${doneCount}/${bTasks.length} เสร็จ)`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // กรณีเลือกใบงานแล้ว จะแสดงหน้า "มอบหมายจัดงานให้ฝ่ายต่างๆ" ซ้าย-ขวา ตามรูปที่ 9 ของ Admin
  const booking = bookings.find(b => b.id === id || b.code === id) || bookings[0];
  const allTasks = assignments.filter(t => t.bookingId === booking.id);

  const unassignedCount = allTasks.filter(t => t.status === 'ยังไม่ได้มอบหมาย').length;
  const assignedCount = allTasks.filter(t => t.status === 'มอบหมายแล้ว' || t.status === 'กำลังดำเนินงาน').length;
  const completedCount = allTasks.filter(t => t.status === 'เสร็จสิ้น').length;

  const filteredTasks = allTasks.filter(t => {
    if (filterTab === 'UNASSIGNED') return t.status === 'ยังไม่ได้มอบหมาย';
    if (filterTab === 'ASSIGNED') return t.status === 'มอบหมายแล้ว' || t.status === 'กำลังดำเนินงาน';
    if (filterTab === 'COMPLETED') return t.status === 'เสร็จสิ้น';
    return true;
  });

  const handleAssignAllDefault = () => {
    allTasks.forEach(t => {
      if (t.status === 'ยังไม่ได้มอบหมาย') {
        assignTaskToStaff(t.id, {
          department: t.department,
          staffId: t.staffId,
          staffName: t.staffName,
          staffPhone: t.staffPhone
        });
      }
    });
  };

  const handleJumpToDepartmentView = (deptName, staffName) => {
    loginAsDepartment(deptName, staffName);
    navigate('/department/assignments');
  };

  return (
    <div className="max-w-6xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/assignments')}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> ย้อนกลับหน้ารายการมอบหมาย
        </button>

        <button
          onClick={handleAssignAllDefault}
          className="px-4 py-2 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-xs font-semibold shadow-sm"
        >
          ✓ ยืนยันมอบหมายงานทุกฝ่ายตามค่ามาตรฐานทันที
        </button>
      </div>

      {/* แถบสรุปข้อมูลงานด้านบน ตามรูปที่ 9 ของ Admin */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 items-center text-xs">
        <div>
          <p className="text-stone-400 font-medium">เลขที่งาน</p>
          <p className="font-bold text-sm text-stone-900 mt-1">{booking.code} ({booking.id})</p>
        </div>
        <div>
          <p className="text-stone-400 font-medium">ผู้เสียชีวิต</p>
          <p className="font-bold text-sm text-stone-900 mt-1">
            {booking.deceased.prefix}{booking.deceased.fullName}
          </p>
        </div>
        <div>
          <p className="text-stone-400 font-medium">วันที่เริ่มจัดงาน</p>
          <p className="font-semibold text-stone-800 mt-1">{booking.startDate}</p>
        </div>
        <div>
          <p className="text-stone-400 font-medium">วันที่ฌาปนกิจ</p>
          <p className="font-semibold text-stone-800 mt-1">{booking.cremationDate}</p>
        </div>
        <div>
          <p className="text-stone-400 font-medium">ผู้ติดต่อ</p>
          <p className="font-semibold text-stone-800 mt-1">{booking.contact.prefix}{booking.contact.fullName}</p>
          <p className="text-stone-500">{booking.contact.phone}</p>
        </div>
        <div>
          <p className="text-stone-400 font-medium">แพ็กเกจที่เลือก</p>
          <p className="font-semibold text-stone-800 mt-1">{booking.packageName}</p>
        </div>
        <div className="p-3 rounded-2xl border border-stone-200 bg-stone-50 text-center">
          <p className="text-[11px] font-bold text-stone-700">สถานะงานปัจจุบัน</p>
          <p className="text-xs font-bold text-blue-700 mt-1">● {booking.status}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">นัดติดต่อ {booking.appointmentDate}</p>
        </div>
      </div>

      {/* กล่องหลัก: มอบหมายจัดงานให้ฝ่ายต่างๆ (แบ่งซ้าย-ขวา ตามรูปที่ 9 ของ Admin) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <h2 className="font-bold text-lg text-stone-900">มอบหมายจัดงานให้ฝ่ายต่างๆ</h2>

        {/* ปุ่มกรองสถานะ 4 แท็บ */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { key: 'ALL', label: `ทั้งหมด (${allTasks.length})` },
            { key: 'UNASSIGNED', label: `ยังไม่ได้มอบหมาย (${unassignedCount})` },
            { key: 'ASSIGNED', label: `มอบหมายแล้ว (${assignedCount})` },
            { key: 'COMPLETED', label: `เสร็จสิ้น (${completedCount})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg border font-semibold transition ${
                filterTab === tab.key
                  ? 'border-[#C5A067] bg-[#FDF6E9] text-[#7C6032]'
                  : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* คอลัมน์ซ้าย: รายการงานที่ต้องมอบหมาย */}
          <div className="lg:col-span-5 rounded-2xl border border-stone-200 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900">รายการงานที่ต้องมอบหมาย</h3>
                <span className="px-2.5 py-1 rounded bg-[#FDF3E3] text-[#7C6032] text-[11px] font-bold">
                  สถานะรวม
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {allTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {t.seq}
                      </span>
                      <span className="font-medium text-stone-800">{t.title}</span>
                    </div>
                    <span
                      className={`font-bold shrink-0 ml-2 ${
                        t.status === 'เสร็จสิ้น'
                          ? 'text-stone-400'
                          : t.status === 'ยังไม่ได้มอบหมาย'
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center gap-4 text-[11px] text-stone-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" /> มอบหมายแล้ว
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ยังไม่ได้มอบหมาย
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-400" /> เสร็จสิ้น
              </span>
            </div>
          </div>

          {/* คอลัมน์ขวา: รายละเอียดการมอบหมาย + เลือกฝ่าย/ผู้รับผิดชอบ + ดูเช็กลิสต์และรูปหน้างาน */}
          <div className="lg:col-span-7 rounded-2xl border border-stone-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900">รายละเอียดการมอบหมาย & ติดตามหน้างาน</h3>
              <span className="text-[11px] text-stone-400">เลือกแผนกและผู้รับผิดชอบได้ทันที</span>
            </div>

            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {filteredTasks.map(task => {
                const deptStaff = staff.filter(s => s.department === task.department);
                const checkedCount = (task.checklist || []).filter(c => c.isChecked).length;
                const totalChk = (task.checklist || []).length;

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      <div className="sm:col-span-4 space-y-1">
                        <p className="font-bold text-stone-900 text-sm">{task.seq}. {task.title}</p>
                        <p className="text-[11px] text-stone-500">หมายเหตุ: {task.note}</p>
                      </div>

                      {/* เลือกฝ่าย */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">มอบหมายให้</label>
                        <select
                          value={task.department}
                          onChange={e => {
                            const nextDept = e.target.value;
                            const firstStaff = staff.find(s => s.department === nextDept);
                            assignTaskToStaff(task.id, {
                              department: nextDept,
                              staffId: firstStaff?.id || '',
                              staffName: firstStaff?.fullName || 'เจ้าหน้าที่ประจำฝ่าย',
                              staffPhone: firstStaff?.phone || '081-234-5678'
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                        >
                          {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      {/* เลือกผู้รับผิดชอบ */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">ผู้รับผิดชอบ</label>
                        <select
                          value={task.staffId}
                          onChange={e => {
                            const picked = staff.find(s => s.id === e.target.value);
                            if (picked) {
                              assignTaskToStaff(task.id, {
                                department: task.department,
                                staffId: picked.id,
                                staffName: picked.fullName,
                                staffPhone: picked.phone
                              });
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                        >
                          {deptStaff.length > 0 ? (
                            deptStaff.map(s => (
                              <option key={s.id} value={s.id}>{s.fullName}</option>
                            ))
                          ) : (
                            <option value={task.staffId}>{task.staffName}</option>
                          )}
                        </select>
                        <p className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                          <span>{task.staffPhone}</span>
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white">
                            <MessageCircle className="w-2.5 h-2.5" />
                          </span>
                        </p>
                      </div>

                      {/* สถานะ */}
                      <div className="sm:col-span-2 text-right space-y-1">
                        <p className="text-[11px] font-bold text-stone-700">สถานะ:</p>
                        <p
                          className={`font-bold ${
                            task.status === 'เสร็จสิ้น'
                              ? 'text-emerald-700'
                              : task.status === 'ยังไม่ได้มอบหมาย'
                              ? 'text-amber-600'
                              : 'text-blue-700'
                          }`}
                        >
                          {task.status}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleJumpToDepartmentView(task.department, task.staffName)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold"
                          title="สลับไปหน้าแผนกนี้เพื่อติ๊กเช็กลิสต์และส่งรูป"
                        >
                          <Wrench className="w-2.5 h-2.5" /> เปิดหน้าแผนก
                        </button>
                      </div>
                    </div>

                    {/* แสดงความคืบหน้าเช็กลิสต์และรูปถ่ายหน้างานที่แผนกส่งเข้ามา */}
                    <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2 text-stone-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          เช็กลิสต์ปฏิบัติงาน: <strong>{checkedCount}/{totalChk} ข้อ</strong>
                        </span>
                        {task.fieldNote && (
                          <span className="text-stone-500 italic">({task.fieldNote})</span>
                        )}
                      </div>

                      {task.photos && task.photos.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {task.photos.map((photoUrl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() =>
                                setPreviewImageModal({
                                  title: `รูปหน้างาน ${task.department} - ${task.title}`,
                                  url: photoUrl
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-emerald-800 font-semibold flex items-center gap-1 hover:bg-emerald-50"
                            >
                              <Eye className="w-3 h-3" /> ดูรูปหน้างาน ({pIdx + 1})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
