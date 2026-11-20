import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  UserCircle2,
  Eye,
  Calendar,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// 1. หน้าประวัติการดำเนินงาน (/admin/history) ตามรูปที่ 4 ของ Admin
export function AdminHistoryPage() {
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [historyTab, setHistoryTab] = useState('COMPLETED'); // 'COMPLETED' | 'CANCELLED' | 'ALL'

  const filteredHistory = bookings.filter(b => {
    const matchSearch =
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.deceased.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.contact.fullName.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (historyTab === 'COMPLETED') return b.status === 'เสร็จสิ้น';
    if (historyTab === 'CANCELLED') return b.status === 'ยกเลิก';
    return true;
  });

  const completedTotal = bookings.filter(b => b.status === 'เสร็จสิ้น').length;
  const cancelledTotal = bookings.filter(b => b.status === 'ยกเลิก').length;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">ประวัติการดำเนินงาน</h1>
        <p className="text-xs text-stone-500">รวบรวมประวัติงานศพที่ส่งมอบเสร็จสิ้นบริบูรณ์แล้ว และรายการที่ถูกยกเลิก</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHistoryTab('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              historyTab === 'COMPLETED'
                ? 'bg-[#2E5A44] text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            งานที่เสร็จสิ้นแล้ว ({completedTotal})
          </button>
          <button
            type="button"
            onClick={() => setHistoryTab('CANCELLED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              historyTab === 'CANCELLED'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            งานที่ยกเลิก ({cancelledTotal})
          </button>
          <button
            type="button"
            onClick={() => setHistoryTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              historyTab === 'ALL'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            ทั้งหมด ({bookings.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="ค้นหารหัสงาน / ชื่อผู้เสียชีวิต / เจ้าภาพ"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-4 pr-9 py-2 rounded-full border border-stone-300 bg-white text-xs sm:text-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-2.5" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-xs text-stone-500">
            ไม่พบรายการในหมวดหมู่นี้
          </div>
        ) : (
          filteredHistory.map(b => (
            <div
              key={b.id}
              onClick={() => navigate(`/admin/requests/${b.id}`)}
              className="cursor-pointer bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <UserCircle2 className="w-10 h-10 text-stone-700" />
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
                <p className="text-sm text-stone-700">{b.contact.prefix}{b.contact.fullName}</p>
              </div>

              <div>
                <p className="text-xs text-stone-400">ช่วงวันจัดงาน</p>
                <p className="text-xs font-medium text-stone-700">{b.startDate} ถึง {b.cremationDate}</p>
              </div>

              <div>
                <p className="text-xs text-stone-400">แพ็กเกจ / ยอดสุทธิ</p>
                <p className="text-sm font-medium text-stone-800">
                  {b.packageName} <span className="text-xs text-[#2E5A44] font-bold">({b.netTotal.toLocaleString()} บ.)</span>
                </p>
              </div>

              <div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    b.status === 'เสร็จสิ้น'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'กำลังดำเนินงาน'
                      ? 'bg-blue-100 text-blue-800'
                      : b.status === 'ยกเลิก'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
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

// 2. หน้าปฏิทินตารางงานทั้งหมด (/admin/schedule)
export function AdminSchedulePage() {
  const { bookings, locations } = useApp();
  const navigate = useNavigate();

  const sortedBookings = [...bookings].sort((a, b) =>
    String(a.startDate || '').localeCompare(String(b.startDate || ''))
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">ปฏิทินตารางงานและการใช้ศาลา</h1>
        <p className="text-xs text-stone-500">ตรวจสอบคิวการใช้ศาลาบำเพ็ญกุศลและวันนัดหมายลูกค้า</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2E5A44]" />
              {loc.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(loc.pavilions || []).map(pav => (
                <span
                  key={pav.id}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium ${
                    pav.isActive === false
                      ? 'bg-stone-100 border-stone-200 text-stone-500 line-through'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {pav.name} (ความจุ {pav.capacity} คน){pav.isActive === false ? ' • ปิดปรับปรุง' : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-stone-900">ตารางคิวงานศพทั้งหมด (เรียงตามวันตั้งศพ)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">รหัสงาน</th>
                <th className="py-3 px-4">งานศพ</th>
                <th className="py-3 px-4">สถานที่ / ศาลา</th>
                <th className="py-3 px-4">วันตั้งศพวันแรก</th>
                <th className="py-3 px-4">วันฌาปนกิจ</th>
                <th className="py-3 px-4">วันเก็บกระดูก</th>
                <th className="py-3 px-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sortedBookings.map(b => (
                <tr
                  key={b.id}
                  onClick={() => navigate(`/admin/requests/${b.id}`)}
                  className="hover:bg-stone-50 cursor-pointer"
                >
                  <td className="py-3 px-4 font-bold text-stone-900">{b.code} ({b.id})</td>
                  <td className="py-3 px-4 font-medium">{b.deceased.prefix}{b.deceased.fullName}</td>
                  <td className="py-3 px-4">{b.locationName} - {b.pavilionName}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-800">{b.startDate}</td>
                  <td className="py-3 px-4 font-semibold text-amber-800">{b.cremationDate}</td>
                  <td className="py-3 px-4">{b.boneCollectionDate}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-semibold ${
                        b.status === 'เสร็จสิ้น'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'กำลังดำเนินงาน'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'ยกเลิก'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
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

// 3. หน้ารายการชำระเงิน (/admin/payments)
export function AdminPaymentsPage() {
  const { bookings, setPreviewImageModal } = useApp();
  const [search, setSearch] = useState('');

  const filteredBookings = bookings.filter(b => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      b.code.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.contact.fullName.toLowerCase().includes(q) ||
      b.deceased.fullName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">รายการชำระเงิน (เต็มจำนวน & แบ่งงวด)</h1>
          <p className="text-xs text-stone-500">ตรวจสอบสถานะการรับชำระเงิน ณ ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวก</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="ค้นหารหัสงาน / เจ้าภาพ / ผู้เสียชีวิต"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-4 pr-9 py-2 rounded-full border border-stone-300 bg-white text-xs sm:text-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[760px]">
            <thead className="bg-[#FAF5EC] text-stone-800 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">รหัสงาน</th>
                <th className="py-3.5 px-4">เจ้าภาพ / ผู้เสียชีวิต</th>
                <th className="py-3.5 px-4">รูปแบบชำระ</th>
                <th className="py-3.5 px-4 text-right">ยอดสุทธิ</th>
                <th className="py-3.5 px-4">งวดที่ 1 (ก่อนเริ่มงาน)</th>
                <th className="py-3.5 px-4">งวดที่ 2 (วันจบงาน)</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-stone-400">
                    ไม่พบรายการชำระเงินที่ตรงกับคำค้นหา
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => {
                  const isCancelled = b.status === 'ยกเลิก';
                  return (
                    <tr key={b.id} className={`hover:bg-stone-50 ${isCancelled ? 'opacity-70 bg-stone-50/40' : ''}`}>
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <div>{b.code} ({b.id})</div>
                        {isCancelled && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            ยกเลิกแล้ว
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-stone-800">{b.contact.fullName}</p>
                        <p className="text-stone-400">งานศพ: {b.deceased.fullName}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 font-semibold text-stone-700">
                          {b.paymentOption === 'FULL'
                            ? 'เต็มจำนวน 100%'
                            : `แบ่ง 2 งวด (${b.installment1Percent}% / ${100 - b.installment1Percent}%)`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                        {b.netTotal.toLocaleString()} บาท
                      </td>
                      <td className="py-3.5 px-4">
                        {isCancelled && !b.installment1Paid ? (
                          <span className="text-stone-400 font-semibold">ยกเลิก (ไม่มีการชำระ)</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${b.installment1Paid ? 'text-emerald-700' : 'text-red-600'}`}>
                              {b.installment1Amount.toLocaleString()} บ. ({b.installment1Paid ? 'ชำระแล้ว' : 'รอชำระ'})
                            </span>
                            {b.installment1Slip && (
                              <button
                                onClick={() =>
                                  setPreviewImageModal({
                                    title: `สลิปงวดที่ 1 - ${b.id}`,
                                    url: b.installment1Slip
                                  })
                                }
                                className="p-1 rounded bg-stone-100 hover:bg-stone-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {b.paymentOption === 'FULL' ? (
                          <span className="text-stone-400">— (จ่ายครบในงวดแรก)</span>
                        ) : isCancelled && !b.installment2Paid ? (
                          <span className="text-stone-400 font-semibold">ยกเลิก</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${b.installment2Paid ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {b.installment2Amount.toLocaleString()} บ. ({b.installment2Paid ? 'ชำระแล้ว' : 'รอชำระวันจบงาน'})
                            </span>
                            {b.installment2Slip && (
                              <button
                                onClick={() =>
                                  setPreviewImageModal({
                                    title: `สลิปงวดที่ 2 - ${b.id}`,
                                    url: b.installment2Slip
                                  })
                                }
                                className="p-1 rounded bg-stone-100 hover:bg-stone-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/requests/${b.id}`}
                          className="px-3 py-1.5 rounded-lg bg-[#2E5A44] text-white font-semibold whitespace-nowrap"
                        >
                          {isCancelled ? 'ดูรายละเอียด' : 'จัดการชำระเงิน'}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// อัตราจัดสรรรายได้เข้ากองทุนชุมชนต่อ 1 งาน (อ้างอิงแคตตาล็อกบ้านวิเวก)
const FUND_RATES_BY_PACKAGE = {
  'PKG-01': { temple: 1300, community: 900, dividend: 700, manager: 900, accountant: 300, coordinator: 300 },
  'PKG-02': { temple: 1900, community: 1100, dividend: 900, manager: 1200, accountant: 400, coordinator: 300 },
  'PKG-03': { temple: 2700, community: 1500, dividend: 1300, manager: 1500, accountant: 500, coordinator: 300 },
  'PKG-04': { temple: 3400, community: 1600, dividend: 1400, manager: 1800, accountant: 600, coordinator: 300 }
};

// 4. หน้ารายงานสรุปรายได้ (/admin/reports)
export function AdminReportsPage() {
  const { bookings } = useApp();

  const activeBookings = bookings.filter(b => b.status !== 'ยกเลิก');
  const cancelledCount = bookings.length - activeBookings.length;

  const totalContractValue = activeBookings.reduce((s, b) => s + Number(b.netTotal || 0), 0);
  const totalReceived = activeBookings.reduce((s, b) => {
    const r1 = b.installment1Paid ? Number(b.installment1Amount || 0) : 0;
    const r2 = b.paymentOption === 'INSTALLMENT' && b.installment2Paid ? Number(b.installment2Amount || 0) : 0;
    return s + r1 + r2;
  }, 0);
  const totalPending = Math.max(0, totalContractValue - totalReceived);

  // คำนวณยอดจัดสรรสะสมจริงจากใบงานที่อนุมัติแล้ว/เสร็จสิ้น
  const approvedBookings = activeBookings.filter(b => b.status === 'กำลังดำเนินงาน' || b.status === 'เสร็จสิ้น');
  const fundSummary = approvedBookings.reduce(
    (acc, b) => {
      const rate = FUND_RATES_BY_PACKAGE[b.packageId] || FUND_RATES_BY_PACKAGE['PKG-01'];
      return {
        temple: acc.temple + rate.temple,
        community: acc.community + rate.community,
        dividend: acc.dividend + rate.dividend,
        manager: acc.manager + rate.manager,
        accountant: acc.accountant + rate.accountant,
        coordinator: acc.coordinator + rate.coordinator
      };
    },
    { temple: 0, community: 0, dividend: 0, manager: 0, accountant: 0, coordinator: 0 }
  );
  const totalFundAllocated = Object.values(fundSummary).reduce((a, b) => a + b, 0);

  const fundRows = [
    { key: 'temple', label: '1. บำรุงวัด (ค่าสถานที่/น้ำไฟ/ปราสาท)' },
    { key: 'community', label: '2. กองกลางวิสาหกิจชุมชนบ้านวิเวก' },
    { key: 'dividend', label: '3. ปันผลหุ้นสมาชิกชุมชน' },
    { key: 'manager', label: '4. ผู้จัดการงานศพ' },
    { key: 'accountant', label: '5. เหรัญญิก / บัญชี' },
    { key: 'coordinator', label: '6. ค่าแนะนำประสานงาน' }
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">รายงานสรุปรายได้และสัดส่วนกองทุนชุมชน</h1>
        <p className="text-xs text-stone-500">สรุปยอดรายรับจริงและยอดค้างชำระของวิสาหกิจชุมชนบ้านวิเวก (ไม่รวมงานที่ยกเลิก)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 text-stone-600 mb-2">
            <TrendingUp className="w-5 h-5 text-[#2E5A44]" />
            <span className="text-xs font-bold">มูลค่างานใช้งานจริงรวม</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{totalContractValue.toLocaleString()} บาท</p>
          <p className="text-xs text-stone-400 mt-1">
            จาก {activeBookings.length} ใบงาน{cancelledCount > 0 ? ` (ตัดงานยกเลิกออก ${cancelledCount} รายการ)` : ''}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-700 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold">รับชำระเงินแล้วสุทธิ</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{totalReceived.toLocaleString()} บาท</p>
          <p className="text-xs text-stone-400 mt-1">มีหลักฐานสลิปตรวจสอบแล้ว</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3 text-amber-700 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-bold">ยอดรอรับชำระ (งวดที่ 1 & งวดที่ 2)</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{totalPending.toLocaleString()} บาท</p>
          <p className="text-xs text-stone-400 mt-1">รอรับชำระ ณ ศูนย์บริการ</p>
        </div>
      </div>

      {/* ตารางการจัดสรรรายได้เข้าชุมชน (รวมยอดสะสมจริงจากใบงานที่อนุมัติแล้ว) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-base text-stone-900">
              การจัดสรรรายได้เข้ากองทุนชุมชนบ้านวิเวก (อัตราต่อ 1 งาน & ยอดสะสมจริง)
            </h2>
            <p className="text-xs text-stone-500">
              คำนวณยอดสะสมจริงจากงานที่อนุมัติ/เสร็จสิ้นแล้วทั้งหมด {approvedBookings.length} งาน
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            จัดสรรเข้ากองทุนสะสมรวม: {totalFundAllocated.toLocaleString()} บาท
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[680px]">
            <thead className="bg-[#FAF5EC] text-stone-800 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">กองทุน / ฝ่ายบริหารชุมชน</th>
                <th className="py-3 px-4 text-right">เริ่มต้น (25,000)</th>
                <th className="py-3 px-4 text-right">ประหยัด (45,000)</th>
                <th className="py-3 px-4 text-right">มาตรฐาน (75,000)</th>
                <th className="py-3 px-4 text-right">พิเศษ (120,000)</th>
                <th className="py-3 px-4 text-right bg-emerald-50 text-emerald-900">ยอดสะสมจริง ({approvedBookings.length} งาน)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {fundRows.map(row => (
                <tr key={row.key}>
                  <td className="py-3 px-4 font-semibold">{row.label}</td>
                  <td className="py-3 px-4 text-right">{FUND_RATES_BY_PACKAGE['PKG-01'][row.key].toLocaleString()} บาท</td>
                  <td className="py-3 px-4 text-right">{FUND_RATES_BY_PACKAGE['PKG-02'][row.key].toLocaleString()} บาท</td>
                  <td className="py-3 px-4 text-right">{FUND_RATES_BY_PACKAGE['PKG-03'][row.key].toLocaleString()} บาท</td>
                  <td className="py-3 px-4 text-right">{FUND_RATES_BY_PACKAGE['PKG-04'][row.key].toLocaleString()} บาท</td>
                  <td className="py-3 px-4 text-right font-bold text-[#2E5A44] bg-emerald-50/40">
                    {fundSummary[row.key].toLocaleString()} บาท
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
