import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminCustomersPage() {
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(
    b =>
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.deceased.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.contact.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-stone-900">ข้อมูล/รายละเอียดลูกค้า</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-bold text-base text-stone-800">รายการทั้งหมด ({filtered.length})</h2>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-full border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#9B7B45]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-2.5" />
        </div>
      </div>

      {/* การ์ดแถวยาวตามรูปดีไซน์ Admin ข้อมูล/รายละเอียดลูกค้า */}
      <div className="space-y-4">
        {filtered.map(b => (
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
                    ? 'bg-red-100 text-red-700'
                    : b.status === 'กำลังดำเนินงาน'
                    ? 'bg-blue-200 text-blue-900'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {b.status === 'กำลังดำเนินงาน' ? 'กำลังดำเนินการ' : b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
