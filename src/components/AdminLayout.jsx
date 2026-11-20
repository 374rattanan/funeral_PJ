import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  MapPin,
  UserCheck,
  ClipboardList,
  History,
  Bell,
  LogOut,
  Calendar,
  CreditCard,
  BarChart3,
  Globe,
  Wrench
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { IS_DEMO_MODE, SITE_CONFIG } from '../config/siteConfig';

const ROUTE_TITLES = [
  { prefix: '/admin/requests', label: 'รายละเอียดคำขอและอนุมัติงาน' },
  { prefix: '/admin/customers', label: 'ข้อมูลและรายละเอียดลูกค้า' },
  { prefix: '/admin/packages', label: 'จัดการแพ็กเกจและบริการเสริม' },
  { prefix: '/admin/locations', label: 'จัดการสถานที่และศาลา' },
  { prefix: '/admin/staff', label: 'จัดการแผนกและบุคลากร' },
  { prefix: '/admin/assignments', label: 'มอบหมายงานให้ฝ่ายปฏิบัติงาน' },
  { prefix: '/admin/schedule', label: 'ปฏิทินตารางงาน' },
  { prefix: '/admin/payments', label: 'รายการชำระเงิน' },
  { prefix: '/admin/history', label: 'ประวัติการดำเนินงาน' },
  { prefix: '/admin/reports', label: 'รายงานสรุปรายได้' }
];

export default function AdminLayout() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    bookings,
    staff
  } = useApp();
  const { user, logout, loginAsDepartment } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);

  if (!user) {
    return <Navigate to="/?login=admin" replace />;
  }

  // บังคับตรวจ Role ห้ามเจ้าหน้าที่แผนกเข้าหน้า Admin
  if (user.role !== 'admin') {
    return <Navigate to="/department" replace />;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pendingRequestsCount = bookings.filter(b => b.status === 'รออนุมัติ').length;

  const currentPageLabel =
    ROUTE_TITLES.find(r => location.pathname.startsWith(r.prefix))?.label ||
    'ภาพรวมระบบบริหารจัดการงานฌาปนกิจ';

  const handleLogoutToPublic = () => {
    logout();
    navigate('/');
  };

  const handleSwitchToDepartment = () => {
    const venueStaff = (staff || []).find(s => s.department === 'ฝ่ายสถานที่');
    loginAsDepartment('ฝ่ายสถานที่', venueStaff?.fullName || 'เจ้าหน้าที่ฝ่ายสถานที่');
    navigate('/department');
  };

  const menuItems = [
    { to: '/admin', label: 'หน้าหลัก', icon: LayoutDashboard, exact: true },
    { to: '/admin/customers', label: 'ข้อมูล/รายละเอียดลูกค้า', icon: Users, badge: pendingRequestsCount },
    { to: '/admin/packages', label: 'แพ็กเกจ', icon: Package },
    { to: '/admin/locations', label: 'สถานที่', icon: MapPin },
    { to: '/admin/staff', label: 'ผู้รับผิดชอบ', icon: UserCheck },
    { to: '/admin/assignments', label: 'มอบหมายจัดงาน', icon: ClipboardList },
    { to: '/admin/schedule', label: 'ปฏิทินตารางงาน', icon: Calendar },
    { to: '/admin/payments', label: 'รายการชำระเงิน', icon: CreditCard },
    { to: '/admin/history', label: 'ประวัติการดำเนินงาน', icon: History },
    { to: '/admin/reports', label: 'รายงานสรุปรายได้', icon: BarChart3 }
  ];

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
            <p className="text-[11px] text-stone-300">
              ระบบจัดการฝั่งแอดมิน{IS_DEMO_MODE ? ' (โหมดสาธิต)' : ''}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#FDF3E3] text-stone-900 shadow-sm font-semibold'
                      : 'text-stone-200 hover:bg-stone-700/60'
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ปุ่มสลับหน้าและออกจากระบบ */}
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
                onClick={handleSwitchToDepartment}
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-[11px] text-center text-white flex items-center justify-center gap-1"
                title="สลับไปทดสอบมุมมองฝ่ายปฏิบัติงาน (เฉพาะโหมดสาธิต)"
              >
                <Wrench className="w-3.5 h-3.5" />
                ฝั่งแผนก
              </button>
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-stone-800 flex items-center justify-center font-bold text-sm shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.displayName || 'Admin'}</p>
                <p className="text-[11px] text-stone-300 truncate">{SITE_CONFIG.brandShortName}</p>
              </div>
            </div>
            <button
              onClick={handleLogoutToPublic}
              className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-700"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="no-print h-16 bg-[#FDF3E3] border-b border-[#EBDCC4] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Link to="/admin" className="font-medium text-stone-800 hover:underline">
              Dashboard
            </Link>
            <span>&gt;</span>
            <span className="text-stone-700 font-medium">{currentPageLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* กระดิ่งแจ้งเตือน */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-full hover:bg-amber-100/80 text-stone-800 transition"
                title="การแจ้งเตือน"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#FAF5EC] border-b border-stone-200 flex items-center justify-between">
                    <span className="font-semibold text-sm text-stone-800">การแจ้งเตือนระบบ ({unreadCount} ใหม่)</span>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-amber-700 hover:underline font-medium"
                    >
                      อ่านทั้งหมดแล้ว
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-stone-400">ไม่มีการแจ้งเตือน</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            setShowNotif(false);
                            if (n.bookingId) navigate(`/admin/requests/${n.bookingId}`);
                          }}
                          className={`p-3.5 cursor-pointer hover:bg-stone-50 transition ${!n.isRead ? 'bg-amber-50/60' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-xs text-stone-800">{n.title}</p>
                            <span className="text-[10px] text-stone-400 shrink-0">{n.createdAt}</span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">{n.message}</p>
                        </div>
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
