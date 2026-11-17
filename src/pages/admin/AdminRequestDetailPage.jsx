import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  UserCircle2,
  FileText,
  Eye,
  CheckCircle2,
  CloudUpload,
  Calendar,
  Sparkles,
  ClipboardList,
  Lock
} from 'lucide-react';
import { useApp, fileToDataUrl } from '../../context/AppContext';
import { SERVICE_CATEGORIES_10, SAMPLE_SLIP_DATA_URL } from '../../data/initialData';

export default function AdminRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    bookings,
    assignments,
    updateBookingPayment,
    approveBookingRequest,
    completeEntireBooking,
    setPreviewImageModal
  } = useApp();

  const booking = bookings.find(b => b.id === id || b.code === id) || bookings[0];
  const [customPercent, setCustomPercent] = useState(booking?.installment1Percent || 25);

  if (!booking) return null;

  const isPending = booking.status === 'รออนุมัติ';
  const isFullPayment = booking.paymentOption === 'FULL';

  const bookingTasks = assignments.filter(t => t.bookingId === booking.id);
  const completedTasksCount = bookingTasks.filter(t => t.status === 'เสร็จสิ้น').length;
  const allTasksCompleted = bookingTasks.length > 0 && completedTasksCount === bookingTasks.length;

  // เปลี่ยนเปอร์เซ็นต์งวดแรก (ตาม Requirement 3.2: แอดมินเลือก 20%, 25%, 30%, 50% หรือกรอกเองได้)
  const handlePercentChange = (newPct) => {
    const pct = Math.min(100, Math.max(5, Number(newPct) || 25));
    setCustomPercent(pct);
    const amount1 = Math.round((booking.netTotal * pct) / 100);
    const amount2 = booking.netTotal - amount1;
    updateBookingPayment(booking.id, {
      installment1Percent: pct,
      installment1Amount: amount1,
      installment2Amount: amount2
    });
  };

  // แนบสลิปงวดที่ 1 (หรือเต็มจำนวน) ด้วย FileReader
  const handleUploadSlip1 = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
    updateBookingPayment(booking.id, {
      installment1Slip: dataUrl,
      installment1Paid: true,
      installment1PaidAt: nowText,
      ...(isFullPayment ? { installment2Paid: true, installment2Slip: dataUrl, installment2PaidAt: nowText } : {})
    });
  };

  // ปุ่มจำลองแนบสลิปด่วน (เพื่อความสะดวกในการทดสอบ)
  const handleQuickAttachSlip1 = () => {
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
    updateBookingPayment(booking.id, {
      installment1Slip: SAMPLE_SLIP_DATA_URL,
      installment1Paid: true,
      installment1PaidAt: nowText,
      ...(isFullPayment ? { installment2Paid: true, installment2Slip: SAMPLE_SLIP_DATA_URL, installment2PaidAt: nowText } : {})
    });
  };

  // แนบสลิปงวดที่ 2 (หลังจบงาน)
  const handleUploadSlip2 = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
    updateBookingPayment(booking.id, {
      installment2Slip: dataUrl,
      installment2Paid: true,
      installment2PaidAt: nowText
    });
  };

  const handleQuickAttachSlip2 = () => {
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
    updateBookingPayment(booking.id, {
      installment2Slip: SAMPLE_SLIP_DATA_URL,
      installment2Paid: true,
      installment2PaidAt: nowText
    });
  };

  const handleApprove = () => {
    if (!booking.installment1Paid || !booking.installment1Slip) return;
    approveBookingRequest(booking.id);
    navigate(`/admin/assignments/${booking.id}`);
  };

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      {/* Header ตามรูปดีไซน์ที่ 10 & 11 ของ Admin */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isPending
              ? `ตรวจสอบและอนุมัติคำขอจัดงาน #${booking.code} (${booking.id})`
              : `รายละเอียดลูกค้า #${booking.code} (${booking.id})`}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            วันที่ส่งคำขอ: {booking.appointmentDate} | นัดติดต่อศูนย์บริการ: <strong>{booking.appointmentDate} ({booking.appointmentTime})</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPending && (
            <Link
              to={`/admin/assignments/${booking.id}`}
              className="px-4 py-2 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              ไปหน้ามอบหมายงาน ({completedTasksCount}/{bookingTasks.length})
            </Link>
          )}
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
          >
            ย้อนกลับ
          </button>
        </div>
      </div>

      {/* แถวที่ 1: ข้อมูลผู้ติดต่อ & ข้อมูลผู้เสียชีวิต พร้อมปุ่มดูเอกสารจริง */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ข้อมูลผู้ติดต่อ */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <h2 className="font-bold text-base text-stone-900 mb-4">ข้อมูลผู้ติดต่อ</h2>
            <div className="flex items-start gap-4 text-xs sm:text-sm">
              <UserCircle2 className="w-11 h-11 text-stone-700 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">ชื่อ-นามสกุล</span>
                  <span className="col-span-2 font-semibold text-stone-900">
                    {booking.contact.prefix}{booking.contact.fullName}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">ความสัมพันธ์</span>
                  <span className="col-span-2 text-stone-800">{booking.contact.relationship}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">เบอร์โทรศัพท์</span>
                  <span className="col-span-2 text-stone-800">{booking.contact.phone}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">ที่อยู่</span>
                  <span className="col-span-2 text-stone-800">
                    {booking.contact.address} ต.{booking.contact.subdistrict} อ.{booking.contact.district} จ.{booking.contact.province} {booking.contact.postalCode}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">LINE ID</span>
                  <span className="col-span-2 text-stone-800">{booking.contact.lineId || '-'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">อีเมล</span>
                  <span className="col-span-2 text-stone-800">{booking.contact.email || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100">
            <p className="font-bold text-xs text-stone-800 mb-2">เอกสารประกอบ</p>
            <div className="p-3 rounded-xl border border-stone-200 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2.5 text-xs font-medium text-stone-800">
                <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-[10px]">PDF/IMG</span>
                <span>สำเนาบัตรประชาชนผู้ติดต่อ</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreviewImageModal({
                    title: `สำเนาบัตรประชาชน - ${booking.contact.fullName}`,
                    url: booking.contact.idCardDoc
                  })
                }
                className="px-3 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> ดูเอกสาร
              </button>
            </div>
          </div>
        </div>

        {/* ข้อมูลผู้เสียชีวิต */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <h2 className="font-bold text-base text-stone-900 mb-4">ข้อมูลผู้เสียชีวิต</h2>
            <div className="flex items-start gap-4 text-xs sm:text-sm">
              <UserCircle2 className="w-11 h-11 text-stone-700 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">ชื่อ-นามสกุล</span>
                  <span className="col-span-2 font-semibold text-stone-900">
                    {booking.deceased.prefix}{booking.deceased.fullName}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">เลขบัตรประชาชน</span>
                  <span className="col-span-2 text-stone-800">{booking.deceased.nationalId}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">เพศ / อายุ</span>
                  <span className="col-span-2 text-stone-800">{booking.deceased.gender} ({booking.deceased.age || 74} ปี)</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">วันเกิด</span>
                  <span className="col-span-2 text-stone-800">{booking.deceased.birthDate}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">วันที่เสียชีวิต</span>
                  <span className="col-span-2 text-stone-800">{booking.deceased.deathDate}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-stone-500">สถานที่เสียชีวิต</span>
                  <span className="col-span-2 text-stone-800">{booking.deceased.placeOfDeath || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100">
            <p className="font-bold text-xs text-stone-800 mb-2">เอกสารประกอบ</p>
            <div className="p-3 rounded-xl border border-stone-200 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2.5 text-xs font-medium text-stone-800">
                <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-[10px]">PDF/IMG</span>
                <span>ใบมรณบัตร / สำเนาบัตรผู้เสียชีวิต</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreviewImageModal({
                    title: `ใบมรณบัตร - ${booking.deceased.fullName}`,
                    url: booking.deceased.deathCertDoc
                  })
                }
                className="px-3 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> ดูเอกสาร
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* แถวที่ 2: แพ็กเกจที่เลือก + 10 หมวดหมู่ + บริการเสริม ตามรูปที่ 10 & 11 */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-2">
            <h2 className="font-bold text-base text-stone-900">แพ็กเกจที่เลือก</h2>
            <div className="p-4 rounded-2xl bg-[#F6F0FA] border border-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-800" />
                <div>
                  <p className="text-xs text-stone-500">แพ็กเกจที่เลือก</p>
                  <p className="font-bold text-sm text-stone-900">{booking.packageName}</p>
                  <p className="text-[11px] text-purple-800 font-medium">{booking.ritualName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-base text-purple-900">
                  {booking.packagePrice.toLocaleString()} บาท
                </p>
                <p className="text-[11px] text-stone-500">ราคาแพ็กเกจ</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="font-bold text-xs text-stone-700 mb-2">รายการในแพ็กเกจ (10 หมวดหมู่)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-700">
              {SERVICE_CATEGORIES_10.map(cat => (
                <div key={cat.id} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{cat.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs sm:text-sm text-stone-800">บริการเสริม (ถ้ามี)</span>
            {booking.ritualUpgradePrice > 0 && (
              <span className="text-xs font-semibold text-amber-800">
                + อัปเกรดพิธีกรรม ({booking.ritualUpgradePrice.toLocaleString()} บาท)
              </span>
            )}
          </div>

          {(!booking.addons || booking.addons.length === 0) && booking.ritualUpgradePrice === 0 ? (
            <p className="text-xs text-stone-500">ไม่มีบริการเสริม</p>
          ) : (
            <div className="space-y-1 text-xs text-stone-700">
              {booking.addons.map(a => (
                <div key={a.id} className="flex justify-between">
                  <span>• {a.name} ({a.qty} {a.unit})</span>
                  <span className="font-semibold">{a.total.toLocaleString()} บาท</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-4">
            <span className="text-xs font-bold text-stone-700">ยอดรวมทั้งหมด</span>
            <span className="text-lg font-bold text-stone-900">{booking.netTotal.toLocaleString()} บาท</span>
          </div>
        </div>
      </div>

      {/* แถวที่ 3: หลักฐานการชำระเงิน (2 งวด / เต็มจำนวน) & รายละเอียดการจัดงาน ตามรูปที่ 10 & 11 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-base text-stone-900">
              {isPending ? 'หลักฐานการชำระเงิน (จำเป็นต้องแนบ ก่อนอนุมัติ)' : 'การชำระเงิน'}
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
              รูปแบบที่ลูกค้าเลือก: {isFullPayment ? 'จ่ายเต็มจำนวน 100%' : 'แบ่งชำระ 2 งวด'}
            </span>
          </div>

          {isPending && !booking.installment1Paid && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
              กรุณารับชำระเงิน ณ ศูนย์บริการ และแนบหลักฐานการชำระเงิน{isFullPayment ? 'เต็มจำนวน' : 'มัดจำ (ส่วนที่ 1)'} ก่อน จึงจะสามารถกดอนุมัติคำขอจัดงานได้
            </div>
          )}

          {/* ตัวเลือกปรับ % งวดแรกสำหรับแอดมิน (กรณีแบ่งชำระ 2 งวด) */}
          {!isFullPayment && (
            <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E6DAC3] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-stone-800">กำหนดสัดส่วนมัดจำงวดที่ 1 (คำนวณแบ่ง 2 งวดอัตโนมัติ):</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[20, 25, 30, 50].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentChange(pct)}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      booking.installment1Percent === pct
                        ? 'bg-[#2E5A44] text-white'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-2">
                  <span>กำหนดเอง:</span>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={customPercent}
                    onChange={e => handlePercentChange(e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg border border-stone-300 text-center font-bold bg-white"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          )}

          {/* กล่องส่วนที่ 1: มัดจำก่อนยืนยันการจอง (หรือจ่ายเต็ม 100%) */}
          <div className="p-5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-7 space-y-1.5">
              <p className="font-bold text-xs sm:text-sm text-stone-900">
                ส่วนที่ 1 : {isFullPayment ? 'ชำระเต็มจำนวน 100% ก่อนยืนยันการจอง' : `มัดจำก่อนยืนยันการจอง (${booking.installment1Percent}%)`}{' '}
                <span className="text-red-600">(จำเป็น)</span>
              </p>
              <div className="flex items-baseline justify-between pr-4 pt-1">
                <span className="text-xs text-stone-500">
                  {booking.installment1Percent}% ของราคาทั้งหมด (จากยอดรวม {booking.netTotal.toLocaleString()} บาท)
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {booking.installment1Amount.toLocaleString()} บาท
                </span>
              </div>
              {booking.installment1Paid ? (
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    ✓ ชำระเงินแล้ว
                  </span>
                  <span className="text-[11px] text-stone-500">เมื่อ {booking.installment1PaidAt}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleQuickAttachSlip1}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  จำลองแนบสลิปรับชำระเงินทันที (สำหรับทดสอบ)
                </button>
              )}
            </div>

            <div className="sm:col-span-5">
              <p className="text-xs font-bold text-stone-700 mb-1.5">หลักฐานการชำระเงินมัดจำ</p>
              {booking.installment1Slip ? (
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={booking.installment1Slip}
                      alt="สลิปงวดที่ 1"
                      className="w-10 h-10 object-cover rounded border border-stone-300"
                    />
                    <span className="text-xs font-medium text-stone-700">รูปสลิป.png</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImageModal({
                          title: `หลักฐานการชำระเงินส่วนที่ 1 (${booking.installment1Amount.toLocaleString()} บาท)`,
                          url: booking.installment1Slip
                        })
                      }
                      className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700"
                      title="ดูสลิป"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <label className="cursor-pointer text-[11px] text-blue-600 hover:underline px-1">
                      เปลี่ยน
                      <input type="file" accept="image/*" onChange={handleUploadSlip1} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block rounded-xl border-2 border-dashed border-stone-300 hover:border-blue-500 bg-stone-50 p-4 text-center transition">
                  <CloudUpload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-stone-700">อัปโหลดไฟล์สลิป</p>
                  <p className="text-[10px] text-stone-400">รองรับไฟล์ JPG, PNG (ไม่เกิน 10 MB)</p>
                  <input type="file" accept="image/*" onChange={handleUploadSlip1} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* กล่องส่วนที่ 2: ชำระส่วนที่เหลือหลังจบงาน (กรณีแบ่งชำระ 2 งวด) */}
          {!isFullPayment && (
            <div className="p-5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-stone-50/40">
              <div className="sm:col-span-7 space-y-1.5">
                <p className="font-bold text-xs sm:text-sm text-stone-900">
                  ส่วนที่ 2 : ชำระส่วนที่เหลือหลังจบงาน ({100 - booking.installment1Percent}%)
                </p>
                <div className="flex items-baseline justify-between pr-4 pt-1">
                  <span className="text-xs text-stone-500">(หลังจบงานและตรวจสอบเรียบร้อย)</span>
                  <span className="text-lg font-bold text-blue-600">
                    {booking.installment2Amount.toLocaleString()} บาท
                  </span>
                </div>
                {booking.installment2Paid ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      ✓ ชำระครบถ้วนแล้ว
                    </span>
                    <span className="text-[11px] text-stone-500">เมื่อ {booking.installment2PaidAt}</span>
                  </div>
                ) : !isPending ? (
                  <button
                    type="button"
                    onClick={handleQuickAttachSlip2}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    จำลองแนบสลิปงวดที่ 2 (วันจบงาน)
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                    <Lock className="w-3.5 h-3.5" /> เปิดให้รับชำระภายหลังเมื่ออนุมัติงานแล้ว
                  </span>
                )}
              </div>

              <div className="sm:col-span-5">
                {booking.installment2Slip ? (
                  <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={booking.installment2Slip}
                        alt="สลิปงวดที่ 2"
                        className="w-10 h-10 object-cover rounded border border-stone-300"
                      />
                      <span className="text-xs font-medium text-stone-700">สลิปงวด2.png</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImageModal({
                          title: `หลักฐานการชำระเงินส่วนที่ 2 (${booking.installment2Amount.toLocaleString()} บาท)`,
                          url: booking.installment2Slip
                        })
                      }
                      className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ) : isPending ? (
                  <div className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-center text-xs text-stone-400">
                    รอดำเนินการในวันจบงาน
                  </div>
                ) : (
                  <label className="cursor-pointer block rounded-xl border-2 border-dashed border-stone-300 hover:border-blue-500 bg-white p-4 text-center transition">
                    <CloudUpload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-stone-700">อัปโหลดสลิปงวดที่ 2</p>
                    <input type="file" accept="image/*" onChange={handleUploadSlip2} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* รายละเอียดการจัดงานด้านขวา */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-bold text-base text-stone-900">รายละเอียดการจัดงาน</h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">วันที่ตั้งศพวันแรก</span>
                <span className="font-semibold text-stone-900">{booking.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">วันฌาปนกิจ</span>
                <span className="font-semibold text-stone-900">{booking.cremationDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">วันเก็บกระดูก</span>
                <span className="font-semibold text-stone-900">{booking.boneCollectionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">สถานที่</span>
                <span className="font-semibold text-stone-900">{booking.locationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ศาลา</span>
                <span className="font-semibold text-stone-900">{booking.pavilionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">จำนวนผู้เข้าร่วมงาน</span>
                <span className="font-semibold text-stone-900">ประมาณ {booking.totalGuests} คน</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ความคืบหน้าแผนก</span>
                <span className="font-bold text-[#2E5A44]">{completedTasksCount} / {bookingTasks.length} งานเสร็จสิ้น</span>
              </div>
            </div>
          </div>

          {/* ปุ่มอนุมัติคำขอ หรือ ปุ่มปิดงาน */}
          <div className="pt-6 border-t border-stone-100 space-y-2">
            {isPending ? (
              <>
                <button
                  type="button"
                  disabled={!booking.installment1Paid || !booking.installment1Slip}
                  onClick={handleApprove}
                  className={`w-full py-3 rounded-xl font-bold text-sm shadow transition ${
                    booking.installment1Paid && booking.installment1Slip
                      ? 'bg-[#3D7352] hover:bg-[#2E5A44] text-white cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  ยืนยันอนุมัติคำขอจัดงาน
                </button>
                {(!booking.installment1Paid || !booking.installment1Slip) && (
                  <p className="text-[11px] text-red-500 text-center">
                    *ต้องแนบสลิปส่วนที่ 1 ก่อน ปุ่มยืนยันจึงจะกดได้
                  </p>
                )}
              </>
            ) : booking.status === 'กำลังดำเนินงาน' ? (
              <button
                type="button"
                disabled={!booking.installment2Paid && !isFullPayment}
                onClick={() => completeEntireBooking(booking.id)}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition ${
                  booking.installment2Paid || isFullPayment
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                ปิดงานเป็น &ldquo;เสร็จสิ้นบริบูรณ์&rdquo;
              </button>
            ) : (
              <div className="py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-center text-xs font-bold">
                ✓ งานนี้ดำเนินการเสร็จสิ้นบริบูรณ์แล้ว
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
