import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
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

export default function DepartmentLayout() {
  const { departments, assignments } = useApp();
  const { user, switchDepartment, loginAsAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const currentDept = user?.department || departments[0] || 'ฝ่ายสถานที่';

  const myTasks = assignments.filter(t => t.department === currentDept);
  const activeCount = myTasks.filter(t => t.status !== 'เสร็จสิ้น').length;

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
      {/* Sidebar สีเทาเข้มตามรูปดีไซน์ฝั่ง Department */}
      <aside className="w-64 bg-[#4A4946] text-stone-100 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-stone-600">
          <div className="w-11 h-11 rounded-full bg-[#9E9B95] text-stone-900 font-bold flex items-center justify-center text-xs">
            Logo
          </div>
          <div>
            <p className="font-semibold text-sm text-white">วิสาหกิจชุมชนบ้านวิเวก</p>
            <p className="text-[11px] text-amber-200">{currentDept}</p>
          </div>
        </div>

        {/* ตัวเลือกสลับแผนกปฏิบัติงาน (ตาม Requirement 1.3) */}
        <div className="px-4 py-3 bg-stone-700/50 border-b border-stone-600">
          <label className="block text-[11px] text-stone-300 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            เลือกสลับแผนกปฏิบัติงาน:
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
            <button
              onClick={handleGoAdmin}
              className="flex-1 py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-[11px] text-center text-white flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              ฝั่งแอดมิน
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white text-stone-800 flex items-center justify-center font-bold text-sm">
                D
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">{currentDept}</p>
                <p className="text-[11px] text-stone-300">ฝ่ายปฏิบัติงาน</p>
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
        <header className="h-16 bg-[#FDF3E3] border-b border-[#EBDCC4] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <span className="font-medium text-stone-800">Dashboard</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#7C6032]">{currentDept}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-700">
              งานที่ต้องทำ: <strong>{activeCount}</strong> รายการ
            </span>
            <div className="relative p-2">
              <Bell className="w-5 h-5 text-stone-700" />
              {activeCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeCount}
                </span>
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
