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

  const completedOrAll = bookings.filter(
    b =>
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.deceased.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.contact.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">ประวัติการดำเนินงาน</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-bold text-base text-stone-800">รายการทั้งหมด</h2>
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
        {completedOrAll.map(b => (
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
              <p className="text-xs text-stone-400">ชื่อผู้ติดต่อ</p>
              <p className="text-sm text-stone-700">{b.contact.prefix}{b.contact.fullName}</p>
            </div>

            <div>
              <p className="text-xs text-stone-400">วันที่จัดงาน</p>
              <p className="text-sm text-stone-700">{b.startDate}</p>
            </div>

            <div>
              <p className="text-xs text-stone-400">แพ็กเกจ</p>
              <p className="text-sm font-medium text-stone-800">{b.packageName}</p>
            </div>

            <div>
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  b.status === 'เสร็จสิ้น'
                    ? 'bg-emerald-100 text-emerald-800'
                    : b.status === 'กำลังดำเนินงาน'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. หน้าปฏิทินตารางงานทั้งหมด (/admin/schedule)
export function AdminSchedulePage() {
  const { bookings, locations } = useApp();
  const navigate = useNavigate();

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
                <span key={pav.id} className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  {pav.name} (ความจุ {pav.capacity} คน)
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-stone-900">ตารางคิวงานศพทั้งหมด</h2>
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
              {bookings.map(b => (
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
                    <span className="px-2.5 py-1 rounded-full bg-stone-100 font-semibold text-stone-800">
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

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">รายการชำระเงิน (เต็มจำนวน & แบ่งงวด)</h1>
        <p className="text-xs text-stone-500">ตรวจสอบสถานะการรับชำระเงิน ณ ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวก</p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
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
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-stone-50">
                <td className="py-3.5 px-4 font-bold text-stone-900">{b.code} ({b.id})</td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-stone-800">{b.contact.fullName}</p>
                  <p className="text-stone-400">งานศพ: {b.deceased.fullName}</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 font-semibold text-stone-700">
                    {b.paymentOption === 'FULL' ? 'เต็มจำนวน 100%' : `แบ่ง 2 งวด (${b.installment1Percent}% / ${100 - b.installment1Percent}%)`}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                  {b.netTotal.toLocaleString()} บาท
                </td>
                <td className="py-3.5 px-4">
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
                </td>
                <td className="py-3.5 px-4">
                  {b.paymentOption === 'FULL' ? (
                    <span className="text-stone-400">— (จ่ายครบในงวดแรก)</span>
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
                    className="px-3 py-1.5 rounded-lg bg-[#2E5A44] text-white font-semibold"
                  >
                    จัดการชำระเงิน
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 4. หน้ารายงานสรุปรายได้ (/admin/reports)
export function AdminReportsPage() {
  const { bookings } = useApp();

  const totalContractValue = bookings.reduce((s, b) => s + b.netTotal, 0);
  const totalReceived = bookings.reduce((s, b) => {
    const r1 = b.installment1Paid ? b.installment1Amount : 0;
    const r2 = b.paymentOption === 'INSTALLMENT' && b.installment2Paid ? b.installment2Amount : 0;
    return s + r1 + r2;
  }, 0);
  const totalPending = totalContractValue - totalReceived;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">รายงานสรุปรายได้และสัดส่วนกองทุนชุมชน</h1>
        <p className="text-xs text-stone-500">สรุปยอดรายรับจริงและยอดค้างชำระของวิสาหกิจชุมชนบ้านวิเวก</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 text-stone-600 mb-2">
            <TrendingUp className="w-5 h-5 text-[#2E5A44]" />
            <span className="text-xs font-bold">มูลค่างานทั้งหมดรวม</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{totalContractValue.toLocaleString()} บาท</p>
          <p className="text-xs text-stone-400 mt-1">จากทั้งหมด {bookings.length} ใบงาน</p>
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

      {/* ตารางการจัดสรรรายได้เข้าชุมชนตามเอกสารแคตตาล็อกบ้านวิเวก */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-stone-900">
          ตารางมาตรฐานการจัดสรรรายได้เข้ากองทุนชุมชนบ้านวิเวก (ต่อ 1 งาน)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5EC] text-stone-800 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">กองทุน / ฝ่ายบริหารชุมชน</th>
                <th className="py-3 px-4 text-right">แพ็กเกจเริ่มต้น (25,000)</th>
                <th className="py-3 px-4 text-right">แพ็กเกจประหยัด (45,000)</th>
                <th className="py-3 px-4 text-right">แพ็กเกจมาตรฐาน (75,000)</th>
                <th className="py-3 px-4 text-right">แพ็กเกจพิเศษ (120,000)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="py-3 px-4 font-semibold">1. บำรุงวัด (ค่าสถานที่/น้ำไฟ/ปราสาท)</td>
                <td className="py-3 px-4 text-right">1,300 บาท</td>
                <td className="py-3 px-4 text-right">1,900 บาท</td>
                <td className="py-3 px-4 text-right">2,700 บาท</td>
                <td className="py-3 px-4 text-right">3,400 บาท</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">2. กองกลางวิสาหกิจชุมชนบ้านวิเวก</td>
                <td className="py-3 px-4 text-right">900 บาท</td>
                <td className="py-3 px-4 text-right">1,100 บาท</td>
                <td className="py-3 px-4 text-right">1,500 บาท</td>
                <td className="py-3 px-4 text-right">1,600 บาท</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">3. ปันผลหุ้นสมาชิกชุมชน</td>
                <td className="py-3 px-4 text-right">700 บาท</td>
                <td className="py-3 px-4 text-right">900 บาท</td>
                <td className="py-3 px-4 text-right">1,300 บาท</td>
                <td className="py-3 px-4 text-right">1,400 บาท</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">4. ผู้จัดการงานศพ</td>
                <td className="py-3 px-4 text-right">900 บาท</td>
                <td className="py-3 px-4 text-right">1,200 บาท</td>
                <td className="py-3 px-4 text-right">1,500 บาท</td>
                <td className="py-3 px-4 text-right">1,800 บาท</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">5. เหรัญญิก / บัญชี</td>
                <td className="py-3 px-4 text-right">300 บาท</td>
                <td className="py-3 px-4 text-right">400 บาท</td>
                <td className="py-3 px-4 text-right">500 บาท</td>
                <td className="py-3 px-4 text-right">600 บาท</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">6. ค่าแนะนำประสานงาน</td>
                <td className="py-3 px-4 text-right">300 บาท</td>
                <td className="py-3 px-4 text-right">300 บาท</td>
                <td className="py-3 px-4 text-right">300 บาท</td>
                <td className="py-3 px-4 text-right">300 บาท</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
