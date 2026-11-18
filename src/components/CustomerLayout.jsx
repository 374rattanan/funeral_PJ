import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Phone, MapPin, ShieldCheck, Wrench, Facebook, MessageCircle, Lock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function CustomerLayout() {
  const { departments, staff } = useApp();
  const { user, loginAsAdmin, loginAsDepartment } = useAuth();
  const navigate = useNavigate();

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [loginRole, setLoginRole] = useState('ADMIN'); // 'ADMIN' | 'DEPARTMENT'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [selectedDept, setSelectedDept] = useState(departments?.[0] || 'ฝ่ายสถานที่');

  const handleStaffLoginSubmit = (e) => {
    e.preventDefault();
    setShowStaffModal(false);
    if (loginRole === 'ADMIN') {
      loginAsAdmin(username || 'admin');
      navigate('/admin');
    } else {
      const deptStaff = (staff || []).find(s => s.department === selectedDept);
      const staffFullName = deptStaff ? `${deptStaff.prefix || ''}${deptStaff.fullName}` : `เจ้าหน้าที่${selectedDept}`;
      loginAsDepartment(selectedDept, staffFullName);
      navigate('/department');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-800">
      {/* Navbar หลักตามรูปดีไซน์ (ไม่มีแถบโหมดทดสอบสีดำ) */}
      <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur border-b border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#9E9B95] text-stone-900 font-bold flex items-center justify-center text-sm shadow-inner">
              Logo
            </div>
            <div>
              <p className="font-bold text-stone-800 text-base sm:text-lg leading-tight">วิสาหกิจชุมชนบ้านวิเวก</p>
              <p className="text-xs text-stone-500">ต.หนองหาร อ.สันทราย จ.เชียงใหม่</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `py-2 border-b-2 transition ${isActive ? 'border-[#9B7B45] text-[#9B7B45] font-semibold' : 'border-transparent hover:text-[#9B7B45]'}`
              }
            >
              หน้าหลัก
            </NavLink>
            <a
              href="/#about-section"
              className="py-2 border-b-2 border-transparent hover:text-[#9B7B45] transition"
            >
              เกี่ยวกับเรา
            </a>
            <NavLink
              to="/packages"
              className={({ isActive }) =>
                `py-2 border-b-2 transition ${isActive ? 'border-[#9B7B45] text-[#9B7B45] font-semibold' : 'border-transparent hover:text-[#9B7B45]'}`
              }
            >
              แพ็กเกจจัดงาน
            </NavLink>
            <NavLink
              to="/portfolio"
              className={({ isActive }) =>
                `py-2 border-b-2 transition ${isActive ? 'border-[#9B7B45] text-[#9B7B45] font-semibold' : 'border-transparent hover:text-[#9B7B45]'}`
              }
            >
              ผลงาน
            </NavLink>
            <NavLink
              to="/check-status"
              className={({ isActive }) =>
                `py-2 border-b-2 transition ${isActive ? 'border-[#9B7B45] text-[#9B7B45] font-semibold' : 'border-transparent hover:text-[#9B7B45]'}`
              }
            >
              ตรวจสอบการจัดงาน
            </NavLink>

            <button
              type="button"
              onClick={() => setShowStaffModal(true)}
              className="ml-2 px-3.5 py-2 rounded-xl border border-[#D5C7AD] bg-white hover:bg-[#F5EFE2] text-stone-700 hover:text-[#7C6032] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Lock className="w-3.5 h-3.5 text-[#9B7B45]" />
              {user ? 'ระบบเจ้าหน้าที่' : 'สำหรับเจ้าหน้าที่'}
            </button>
          </nav>

          <div className="flex md:hidden items-center gap-2 text-xs">
            <Link to="/packages" className="px-3 py-1.5 rounded-lg bg-[#9B7B45] text-white font-medium">
              แพ็กเกจ
            </Link>
            <Link to="/check-status" className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-medium">
              เช็กสถานะ
            </Link>
            <button
              type="button"
              onClick={() => setShowStaffModal(true)}
              className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-700"
              title="สำหรับเจ้าหน้าที่"
            >
              <Lock className="w-4 h-4 text-[#9B7B45]" />
            </button>
          </div>
        </div>
      </header>

      {/* เนื้อหาหลัก */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer ตามรูปดีไซน์ */}
      <footer className="bg-[#FAF6EE] border-t border-[#E6DAC3] mt-16 py-10 text-stone-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:border-r md:border-stone-300 md:pr-6">
              <h4 className="font-bold text-stone-900 mb-3">บริการ</h4>
              <p className="text-sm leading-relaxed text-stone-600">
                จัดงานศพแบบครบวงจร ที่ดูแลด้วยใจ<br />
                โดยคนในชุมชน เพื่อคนสำคัญของคุณ
              </p>
              <button
                type="button"
                onClick={() => setShowStaffModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B7B45] hover:underline"
              >
                <Lock className="w-3.5 h-3.5" />
                เข้าสู่ระบบสำหรับเจ้าหน้าที่
              </button>
            </div>

            <div className="md:border-r md:border-stone-300 md:px-6">
              <h4 className="font-bold text-stone-900 mb-3">ช่องทางการติดต่อ</h4>
              <ul className="space-y-2 text-sm text-stone-700">
                <li className="flex items-center gap-2.5">
                  <Facebook className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>กลุ่มรับเหมาจัดงานบ้านวิเวก</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>LINE: กลุ่มรับเหมาจัดงานบ้านวิเวก</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>0123456789</span>
                </li>
              </ul>
              <p className="text-xs text-stone-500 mt-3">ติดต่อได้ทุกวัน 8.00 - 17.00 น.</p>
            </div>

            <div className="flex items-start justify-between gap-4 md:pl-4">
              <div>
                <h4 className="font-bold text-stone-900 mb-3">ที่อยู่</h4>
                <p className="text-sm text-stone-700 leading-relaxed">
                  หมู่ 8 ตำบล หนองหาร<br />
                  อำเภอสันทราย<br />
                  จังหวัดเชียงใหม่ 50290
                </p>
              </div>
              <div className="w-20 h-20 rounded-xl border-2 border-stone-700 flex items-center justify-center bg-white/80 shrink-0">
                <MapPin className="w-10 h-10 text-stone-800" />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal เข้าสู่ระบบสำหรับเจ้าหน้าที่ (Admin & ฝ่ายปฏิบัติงาน) */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#E6DAC3] shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowStaffModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF5EC] border border-[#E6DAC3] flex items-center justify-center mx-auto mb-3 text-[#9B7B45]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">เข้าสู่ระบบสำหรับเจ้าหน้าที่</h3>
              <p className="text-xs text-stone-500 mt-1">วิสาหกิจชุมชนบ้านวิเวก ต.หนองหาร อ.สันทราย จ.เชียงใหม่</p>
            </div>

            {/* สลับบทบาท: แอดมินศูนย์บริการ vs ฝ่ายปฏิบัติงาน */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-stone-100 mb-5">
              <button
                type="button"
                onClick={() => setLoginRole('ADMIN')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  loginRole === 'ADMIN'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#9B7B45]" />
                ผู้ดูแลระบบ (Admin)
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('DEPARTMENT')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  loginRole === 'DEPARTMENT'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Wrench className="w-4 h-4 text-[#2E5A44]" />
                ฝ่ายปฏิบัติงาน
              </button>
            </div>

            <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
              {loginRole === 'ADMIN' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#9B7B45]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสผ่าน (Password)</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#9B7B45]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">เลือกฝ่ายปฏิบัติงาน</label>
                    <select
                      value={selectedDept}
                      onChange={e => setSelectedDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#2E5A44]"
                    >
                      {(departments || []).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสผ่านประจำฝ่าย</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#2E5A44]"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition ${
                  loginRole === 'ADMIN'
                    ? 'bg-[#9B7B45] hover:bg-[#846738]'
                    : 'bg-[#2E5A44] hover:bg-[#234635]'
                }`}
              >
                {loginRole === 'ADMIN' ? 'เข้าสู่ระบบผู้ดูแลระบบ' : `เข้าสู่ระบบ (${selectedDept})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
