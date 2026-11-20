import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, UserCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminCustomersPage() {
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const statusPriority = {
    รออนุมัติ: 0,
    กำลังดำเนินงาน: 1
  };

  const filtered = bookings
    .filter(b => b.status === 'รออนุมัติ' || b.status === 'กำลังดำเนินงาน')
    .filter(b => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        b.code.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.deceased.fullName.toLowerCase().includes(q) ||
        b.contact.fullName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99));

  const pendingCount = filtered.filter(b => b.status === 'รออนุมัติ').length;
  const activeCount = filtered.filter(b => b.status === 'กำลังดำเนินงาน').length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">ข้อมูล/รายละเอียดลูกค้า</h1>
        <p className="text-xs text-stone-500 mt-1">
          แสดงเฉพาะงานสถานะรออนุมัติและกำลังดำเนินงาน (งานที่เสร็จสิ้นแล้วจะแสดงในเมนู &ldquo;ประวัติการดำเนินงาน&rdquo;)
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold text-base text-stone-800">รายการที่ต้องดูแล ({filtered.length})</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            รออนุมัติ {pendingCount}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
            กำลังดำเนินงาน {activeCount}
          </span>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="ค้นหาเลขงาน / ชื่อผู้เสียชีวิต / เจ้าภาพ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-full border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#9B7B45]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-2.5" />
        </div>
      </div>

      {/* การ์ดแถวยาวรายการลูกค้า */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-stone-200 text-center space-y-3">
            <p className="text-sm text-stone-500">
              ไม่มีรายการงานสถานะรออนุมัติหรือกำลังดำเนินงานในขณะนี้
            </p>
            <Link
              to="/admin/history"
              className="inline-block px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
            >
              ดูงานที่เสร็จสิ้นแล้วในประวัติการดำเนินงาน →
            </Link>
          </div>
        ) : (
          filtered.map(b => (
            <div
              key={b.id}
              onClick={() => navigate(`/admin/requests/${b.id}`)}
              className="cursor-pointer bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <UserCircle2 className="w-10 h-10 text-stone-700 shrink-0" />
                <span className="font-bold text-sm text-stone-900 w-16">{b.code}</span>
                <div>
                  <p className="text-xs text-stone-400">ชื่อผู้เสียชีวิต</p>
                  <p className="text-sm font-semibold text-stone-800">
                    {b.deceased.prefix}{b.deceased.fullName}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-stone-400">ชื่อผู้ติดต่อ (เจ้าภาพ)</p>
                <p className="text-sm font-medium text-stone-800">
                  {b.contact.prefix}{b.contact.fullName}
                </p>
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
                    b.status === 'รออนุมัติ'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-200 text-blue-900'
                  }`}
                >
                  {b.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
