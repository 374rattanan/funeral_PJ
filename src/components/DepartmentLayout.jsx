import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  History,
  Bell,
  LogOut,
  Globe,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { IS_DEMO_MODE, SITE_CONFIG, normalizeDepartmentName } from '../config/siteConfig';

export default function DepartmentLayout() {
  const { departments, assignments, bookings } = useApp();
  const { user, switchDepartment, loginAsAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);

  if (!user) {
    return <Navigate to="/?login=department" replace />;
  }

  // บังคับตรวจ Role ห้ามข้ามสิทธิ์
  if (user.role !== 'department') {
    return <Navigate to="/admin" replace />;
  }

  const currentDept = normalizeDepartmentName(user?.department || departments[0] || 'ฝ่ายสถานที่');

  // แสดงเฉพาะงานของใบจองที่อนุมัติแล้ว (ตัดงาน 'รออนุมัติ' และ 'ยกเลิก' ออก)
  const approvedBookingIds = new Set(
    (bookings || [])
      .filter(b => b.status === 'กำลังดำเนินงาน' || b.status === 'เสร็จสิ้น')
      .map(b => b.id)
  );
  const myTasks = (assignments || []).filter(
    t =>
      normalizeDepartmentName(t.department) === currentDept &&
      t.status !== 'ยกเลิก' &&
      approvedBookingIds.has(t.bookingId)
  );
  const activeTasks = myTasks.filter(t => t.status !== 'เสร็จสิ้น');
  const activeCount = activeTasks.length;

  const handleGoAdmin = () => {
    loginAsAdmin();
    navigate('/admin');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#F8F6F2] text-stone-800">
      {/* Sidebar */}
      <aside className="no-print w-64 bg-[#4A4946] text-stone-100 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-stone-600">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C8A46B] to-[#9B7B45] text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
            บว
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{SITE_CONFIG.brandName}</p>
            <p className="text-[11px] text-amber-200 truncate">{currentDept}</p>
          </div>
        </div>

        {/* ตัวเลือกสลับแผนก (เปิดให้สลับได้เฉพาะโหมดสาธิต ในโหมดใช้งานจริงล็อกตามบัญชีที่เข้าสู่ระบบ) */}
        {IS_DEMO_MODE ? (
          <div className="px-4 py-3 bg-stone-700/50 border-b border-stone-600">
            <label className="text-[11px] text-stone-300 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              สลับแผนกปฏิบัติงาน (โหมดสาธิต):
            </label>
            <select
              value={currentDept}
              onChange={(e) => switchDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 text-white text-xs border border-stone-500 focus:outline-none focus:border-amber-400"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="px-4 py-3 bg-stone-700/40 border-b border-stone-600">
            <p className="text-[11px] text-stone-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate font-semibold text-white">{currentDept}</span>
            </p>
          </div>
        )}

        <nav className="flex-1 px-3 py-5 space-y-2">
          <NavLink
            to="/department"
            end
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-[#FDF3E3] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-200 hover:bg-stone-700/60'
              }`
            }
          >
            <span className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>หน้าหลัก</span>
            </span>
          </NavLink>

          <NavLink
            to="/department/assignments"
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-[#FDF3E3] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-200 hover:bg-stone-700/60'
              }`
            }
          >
            <span className="flex items-center gap-2.5">
              <ClipboardCheck className="w-4 h-4" />
              <span>งานที่ได้รับมอบหมาย</span>
            </span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500 text-white">
                {activeCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/department/history"
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-[#FDF3E3] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-200 hover:bg-stone-700/60'
              }`
            }
          >
            <span className="flex items-center gap-2.5">
              <History className="w-4 h-4" />
              <span>ประวัติการดำเนินงาน</span>
            </span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-stone-600 space-y-2">
          <div className="flex gap-1.5">
            <Link
              to="/"
              className="flex-1 py-1.5 px-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-[11px] text-center text-stone-200 flex items-center justify-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              หน้าลูกค้า
            </Link>
            {IS_DEMO_MODE && (
              <button
                onClick={handleGoAdmin}
                className="flex-1 py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-[11px] text-center text-white flex items-center justify-center gap-1"
                title="สลับไปทดสอบฝั่งแอดมิน (เฉพาะโหมดสาธิต)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                ฝั่งแอดมิน
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-stone-800 flex items-center justify-center font-bold text-sm shrink-0">
                D
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">{user.displayName || currentDept}</p>
                <p className="text-[11px] text-stone-300 truncate">{currentDept}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-700"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="no-print h-16 bg-[#FDF3E3] border-b border-[#EBDCC4] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Link to="/department" className="font-medium text-stone-800 hover:underline">
              Dashboard
            </Link>
            <span>&gt;</span>
            <span className="font-semibold text-[#7C6032]">{currentDept}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-700">
              งานที่ต้องทำ: <strong>{activeCount}</strong> รายการ
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-full hover:bg-amber-100/80 transition"
                title="งานที่ได้รับมอบหมาย"
              >
                <Bell className="w-5 h-5 text-stone-700" />
                {activeCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#FAF5EC] border-b border-stone-200 flex items-center justify-between">
                    <span className="font-semibold text-xs text-stone-800">
                      งานค้างดำเนินการของ{currentDept} ({activeCount})
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {activeTasks.length === 0 ? (
                      <p className="p-4 text-center text-xs text-stone-400">ไม่มีงานค้างดำเนินการ</p>
                    ) : (
                      activeTasks.map(task => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => {
                            setShowNotif(false);
                            navigate('/department/assignments');
                          }}
                          className="w-full text-left p-3 hover:bg-stone-50 transition"
                        >
                          <p className="font-semibold text-xs text-stone-800">{task.title}</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            งาน #{task.bookingCode || task.bookingId} • {task.locationDisplay} • {task.status}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
