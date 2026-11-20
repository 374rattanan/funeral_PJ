import React, { useState, useEffect } from 'react';
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
  Lock,
  Edit3,
  XCircle,
  Plus,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp, fileToDataUrl } from '../../context/AppContext';
import { SERVICE_CATEGORIES_10, SAMPLE_SLIP_DATA_URL } from '../../data/initialData';
import { IS_DEMO_MODE } from '../../config/siteConfig';

export default function AdminRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    bookings,
    assignments,
    services,
    locations,
    updateBookingPayment,
    updateBookingDetails,
    cancelBookingRequest,
    approveBookingRequest,
    completeEntireBooking,
    setPreviewImageModal
  } = useApp();

  const booking = bookings.find(b => b.id === id || b.code === id) || null;
  const [customPercent, setCustomPercent] = useState(booking?.installment1Percent || 25);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('ลูกค้าไม่มาติดต่อชำระเงินตามวันเวลานัดหมาย');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    if (booking) {
      setCustomPercent(booking.installment1Percent || 25);
    }
  }, [booking?.id, booking?.installment1Percent]);

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
          <h1 className="text-xl font-bold text-stone-900">ไม่พบข้อมูลคำขอจัดงาน "{id}"</h1>
          <p className="text-sm text-stone-500">รายการนี้อาจไม่มีอยู่ในระบบหรือรหัสคำขอไม่ถูกต้อง</p>
          <button
            onClick={() => navigate('/admin/customers')}
            className="px-6 py-2.5 rounded-xl bg-stone-800 text-white text-xs font-semibold"
          >
            กลับไปหน้ารายชื่อลูกค้าทั้งหมด
          </button>
        </div>
      </div>
    );
  }

  const isPending = booking.status === 'รออนุมัติ';
  const isCancelled = booking.status === 'ยกเลิก';
  const isCompleted = booking.status === 'เสร็จสิ้น';
  const isFullPayment = booking.paymentOption === 'FULL';

  const bookingTasks = assignments.filter(t => t.bookingId === booking.id);
  const completedTasksCount = bookingTasks.filter(t => t.status === 'เสร็จสิ้น').length;
  const allTasksCompleted = bookingTasks.length > 0 && completedTasksCount === bookingTasks.length;

  // เปิด Modal แก้ไขข้อมูลการจัดงานและบริการเสริมหน้างาน
  const handleOpenEditModal = () => {
    const addonMap = {};
    (booking.addons || []).forEach(a => {
      addonMap[a.id] = a.qty;
    });
    setEditForm({
      locationId: booking.locationId,
      pavilionId: booking.pavilionId,
      startDate: booking.startDate,
      cremationDate: booking.cremationDate,
      boneCollectionDate: booking.boneCollectionDate,
      totalGuests: booking.totalGuests || booking.baseGuests || 100,
      addonMap
    });
    setShowEditModal(true);
  };

  const handleSaveEditDetails = (e) => {
    e.preventDefault();
    if (!editForm) return;
    if (!editForm.startDate || !editForm.cremationDate) {
      window.alert('กรุณาระบุวันตั้งศพวันแรกและวันฌาปนกิจให้ครบถ้วน');
      return;
    }
    if (editForm.cremationDate < editForm.startDate) {
      window.alert('วันฌาปนกิจต้องไม่ก่อนวันตั้งศพวันแรก');
      return;
    }
    const nextBoneDate = editForm.boneCollectionDate || editForm.cremationDate;
    if (nextBoneDate < editForm.cremationDate) {
      window.alert('วันเก็บกระดูกต้องไม่ก่อนวันฌาปนกิจ');
      return;
    }

    // ตรวจสอบคิวศาลาชนกับงานอื่นก่อนบันทึก
    const conflict = bookings.find(other => {
      if (other.id === booking.id || other.status === 'ยกเลิก') return false;
      if (other.locationId !== editForm.locationId || other.pavilionId !== editForm.pavilionId) return false;
      const otherEnd = other.boneCollectionDate || other.cremationDate || other.startDate;
      return editForm.startDate <= otherEnd && nextBoneDate >= other.startDate;
    });
    if (conflict) {
      window.alert(`ไม่สามารถย้ายไปวัน/ศาลานี้ได้ เนื่องจากคิวชนกับงาน ${conflict.code} (${conflict.startDate} - ${conflict.boneCollectionDate || conflict.cremationDate})`);
      return;
    }

    const loc = locations.find(l => l.id === editForm.locationId) || locations[0];
    const pav = (loc?.pavilions || []).find(p => p.id === editForm.pavilionId) || loc?.pavilions?.[0];
    const baseGuests = booking.baseGuests || 100;
    const nextGuests = Math.max(baseGuests, Number(editForm.totalGuests) || baseGuests);
    const extraGuests = Math.max(0, nextGuests - baseGuests);
    const extraGuestsCost = extraGuests * 150;

    const nextAddons = Object.entries(editForm.addonMap || {})
      .filter(([, qty]) => Number(qty) > 0)
      .map(([srvId, qty]) => {
        const srv = services.find(s => s.id === srvId) || (booking.addons || []).find(a => a.id === srvId);
        if (!srv) return null;
        const q = Number(qty) || 1;
        return {
          id: srv.id,
          name: srv.name,
          unit: srv.unit,
          price: srv.price,
          qty: q,
          total: srv.price * q
        };
      })
      .filter(Boolean);

    const addonsOnlyTotal = nextAddons.reduce((sum, item) => sum + item.total, 0);
    const nextAddonsTotal = addonsOnlyTotal + extraGuestsCost;
    const nextNetTotal = (Number(booking.packagePrice) || 0) + (Number(booking.ritualUpgradePrice) || 0) + nextAddonsTotal;

    updateBookingDetails(booking.id, {
      locationId: loc?.id || booking.locationId,
      locationName: loc?.name || booking.locationName,
      pavilionId: pav?.id || booking.pavilionId,
      pavilionName: pav?.name || booking.pavilionName,
      startDate: editForm.startDate,
      cremationDate: editForm.cremationDate,
      boneCollectionDate: nextBoneDate,
      totalGuests: nextGuests,
      extraGuests,
      extraGuestsCost,
      addons: nextAddons,
      addonsTotal: nextAddonsTotal,
      netTotal: nextNetTotal
    });
    setShowEditModal(false);
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    cancelBookingRequest(booking.id, cancelReason.trim() || 'ยกเลิกคำขอโดยผู้ดูแลระบบ');
    setShowCancelModal(false);
  };

  const handleCompleteBooking = () => {
    if (!allTasksCompleted) {
      const ok = window.confirm(
        `ขณะนี้ฝ่ายปฏิบัติงานส่งงานเสร็จแล้ว ${completedTasksCount}/${bookingTasks.length} งาน\nคุณต้องการยืนยันปิดงานเป็น "เสร็จสิ้นบริบูรณ์" ทันทีหรือไม่?`
      );
      if (!ok) return;
    }
    completeEntireBooking(booking.id);
  };

  // เปลี่ยนเปอร์เซ็นต์งวดแรก (อนุญาตเฉพาะก่อนชำระเงินงวดแรกเท่านั้น)
  const handlePercentChange = (newPct) => {
    if (booking.installment1Paid || isCompleted || isCancelled) return;
    const pct = Math.min(95, Math.max(5, Number(newPct) || 25));
    setCustomPercent(pct);
    const amount1 = Math.round((booking.netTotal * pct) / 100);
    const amount2 = booking.netTotal - amount1;
    updateBookingPayment(booking.id, {
      installment1Percent: pct,
      installment1Amount: amount1,
      installment2Amount: amount2
    });
  };

  // แนบสลิปงวดที่ 1 (หรือเต็มจำนวน) — ห้ามเขียน installment2Slip ให้แผน FULL
  const handleUploadSlip1 = async (e) => {
    if (isCancelled || isCompleted) return;
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
      ...(isFullPayment ? { installment2Paid: true } : {})
    });
  };

  // ปุ่มจำลองแนบสลิปด่วน (เฉพาะโหมดสาธิต)
  const handleQuickAttachSlip1 = () => {
    if (isCancelled || isCompleted) return;
    const nowText = new Date().toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' น.';
    updateBookingPayment(booking.id, {
      installment1Slip: SAMPLE_SLIP_DATA_URL,
      installment1Paid: true,
      installment1PaidAt: nowText,
      ...(isFullPayment ? { installment2Paid: true } : {})
    });
  };

  // แนบสลิปงวดที่ 2 (หลังจบงาน)
  const handleUploadSlip2 = async (e) => {
    if (isCancelled || isCompleted) return;
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
    if (isCancelled || isCompleted) return;
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

  const createdDateLabel = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
    : booking.appointmentDate;

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isPending
              ? `ตรวจสอบและอนุมัติคำขอจัดงาน #${booking.code} (${booking.id})`
              : `รายละเอียดลูกค้า #${booking.code} (${booking.id})`}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            วันที่ส่งคำขอ: {createdDateLabel} | นัดติดต่อศูนย์บริการ: <strong>{booking.appointmentDate} ({booking.appointmentTime})</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isCompleted && !isCancelled && (
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="px-3.5 py-2 rounded-xl border border-[#9B7B45] bg-[#FAF5EC] hover:bg-[#F3E8D3] text-[#7C6032] text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              แก้ไขวัน/ศาลา/บริการเสริม
            </button>
          )}
          {!isPending && !isCancelled && (
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

      {isCancelled && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-red-900 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">คำขอจัดงานนี้ถูกยกเลิกแล้ว (คืนคิวศาลาเรียบร้อย)</p>
            <p className="text-xs mt-0.5">เหตุผลการยกเลิก: {booking.cancelReason || 'ยกเลิกโดยผู้ดูแลระบบ'}</p>
          </div>
        </div>
      )}

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
                disabled={!booking.contact.idCardDoc}
                onClick={() =>
                  setPreviewImageModal({
                    title: `สำเนาบัตรประชาชน - ${booking.contact.fullName}`,
                    url: booking.contact.idCardDoc
                  })
                }
                className="px-3 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-stone-700 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> {booking.contact.idCardDoc ? 'ดูเอกสาร' : 'ไม่มีเอกสาร'}
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
                disabled={!booking.deceased.deathCertDoc}
                onClick={() =>
                  setPreviewImageModal({
                    title: `ใบมรณบัตร - ${booking.deceased.fullName}`,
                    url: booking.deceased.deathCertDoc
                  })
                }
                className="px-3 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-stone-700 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> {booking.deceased.deathCertDoc ? 'ดูเอกสาร' : 'ไม่มีเอกสาร'}
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
            <span className="font-bold text-xs sm:text-sm text-stone-800">รายการเพิ่มเติม & บริการเสริม (ถ้ามี)</span>
            {booking.ritualUpgradePrice > 0 && (
              <span className="text-xs font-semibold text-amber-800">
                + อัปเกรดพิธีกรรม ({booking.ritualUpgradePrice.toLocaleString()} บาท)
              </span>
            )}
          </div>

          {(!booking.addons || booking.addons.length === 0) &&
          Number(booking.ritualUpgradePrice || 0) === 0 &&
          Number(booking.extraGuestsCost || 0) === 0 ? (
            <p className="text-xs text-stone-500">ไม่มีรายการเพิ่มเติมหรือบริการเสริม</p>
          ) : (
            <div className="space-y-1 text-xs text-stone-700">
              {Number(booking.ritualUpgradePrice || 0) > 0 && (
                <div className="flex justify-between">
                  <span>• อัปเกรดรูปแบบพิธีกรรม ({booking.ritualName})</span>
                  <span className="font-semibold">{Number(booking.ritualUpgradePrice).toLocaleString()} บาท</span>
                </div>
              )}
              {Number(booking.extraGuestsCost || 0) > 0 && (
                <div className="flex justify-between">
                  <span>• ค่าแขกเพิ่มเติม ({booking.extraGuests} คน)</span>
                  <span className="font-semibold">{Number(booking.extraGuestsCost).toLocaleString()} บาท</span>
                </div>
              )}
              {(booking.addons || []).map(a => (
                <div key={a.id} className="flex justify-between">
                  <span>• {a.name} ({a.qty} {a.unit})</span>
                  <span className="font-semibold">{Number(a.total || 0).toLocaleString()} บาท</span>
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
              <div>
                <span className="font-bold text-stone-800">กำหนดสัดส่วนมัดจำงวดที่ 1 (คำนวณแบ่ง 2 งวดอัตโนมัติ):</span>
                {(booking.installment1Paid || isCompleted || isCancelled) && (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    ล็อกสัดส่วนแล้ว เนื่องจากรับชำระงวดที่ 1 หรือปิด/ยกเลิกงานเรียบร้อยแล้ว
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[20, 25, 30, 50].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    disabled={booking.installment1Paid || isCompleted || isCancelled}
                    onClick={() => handlePercentChange(pct)}
                    className={`px-3 py-1 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    disabled={booking.installment1Paid || isCompleted || isCancelled}
                    value={customPercent}
                    onChange={e => handlePercentChange(e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg border border-stone-300 text-center font-bold bg-white disabled:bg-stone-100 disabled:text-stone-400"
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
              ) : IS_DEMO_MODE && !isCancelled && !isCompleted ? (
                <button
                  type="button"
                  onClick={handleQuickAttachSlip1}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  จำลองแนบสลิปรับชำระเงินทันที (เดโม)
                </button>
              ) : (
                <span className="inline-block text-[11px] text-stone-500 pt-1">
                  {isCancelled ? 'คำขอถูกยกเลิกแล้ว' : 'รออัปโหลดหลักฐานการชำระเงิน'}
                </span>
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
                    <span className="text-xs font-medium text-stone-700">สลิปงวดที่ 1</span>
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
                    {!isCancelled && !isCompleted && (
                      <label className="cursor-pointer text-[11px] text-blue-600 hover:underline px-1">
                        เปลี่ยน
                        <input type="file" accept="image/*" onChange={handleUploadSlip1} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              ) : isCancelled || isCompleted ? (
                <div className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-center text-xs text-stone-400">
                  {isCancelled ? 'ยกเลิกคำขอแล้ว' : 'ปิดงานแล้ว'}
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
                ) : !isPending && !isCancelled && !isCompleted ? (
                  IS_DEMO_MODE ? (
                    <button
                      type="button"
                      onClick={handleQuickAttachSlip2}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      จำลองแนบสลิปงวดที่ 2 (เดโม)
                    </button>
                  ) : (
                    <span className="inline-block text-[11px] text-amber-700 pt-1">
                      รอรับชำระส่วนที่เหลือหลังจบงาน
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                    <Lock className="w-3.5 h-3.5" />{' '}
                    {isCancelled
                      ? 'คำขอถูกยกเลิกแล้ว'
                      : isCompleted
                      ? 'ปิดงานแล้ว'
                      : 'เปิดให้รับชำระภายหลังเมื่ออนุมัติงานแล้ว'}
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
                      <span className="text-xs font-medium text-stone-700">สลิปงวดที่ 2</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImageModal({
                            title: `หลักฐานการชำระเงินส่วนที่ 2 (${booking.installment2Amount.toLocaleString()} บาท)`,
                            url: booking.installment2Slip
                          })
                        }
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700"
                        title="ดูสลิป"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!isCancelled && !isCompleted && (
                        <label className="cursor-pointer text-[11px] text-blue-600 hover:underline px-1">
                          เปลี่ยน
                          <input type="file" accept="image/*" onChange={handleUploadSlip2} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                ) : isPending || isCancelled || isCompleted ? (
                  <div className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-center text-xs text-stone-400">
                    {isCancelled ? 'ยกเลิกคำขอแล้ว' : isCompleted ? 'ปิดงานแล้ว' : 'รอดำเนินการในวันจบงาน'}
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

          {/* ปุ่มอนุมัติคำขอ หรือ ปุ่มปิดงาน หรือ ปุ่มยกเลิกคำขอ */}
          <div className="pt-6 border-t border-stone-100 space-y-2.5">
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
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <XCircle className="w-4 h-4" />
                  ยกเลิก / ปฏิเสธคำขอจัดงาน
                </button>
              </>
            ) : booking.status === 'กำลังดำเนินงาน' ? (
              <>
                <button
                  type="button"
                  disabled={!booking.installment2Paid && !isFullPayment}
                  onClick={handleCompleteBooking}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition ${
                    booking.installment2Paid || isFullPayment
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  ปิดงานเป็น &ldquo;เสร็จสิ้นบริบูรณ์&rdquo;
                </button>
                {!booking.installment2Paid && !isFullPayment && (
                  <p className="text-[11px] text-amber-700 text-center">
                    *ต้องแนบสลิปงวดที่ 2 ก่อน จึงจะปิดงานเป็นเสร็จสิ้นได้
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs flex items-center justify-center gap-1 transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  ยกเลิกงานนี้
                </button>
              </>
            ) : isCancelled ? (
              <div className="py-2.5 rounded-xl bg-red-100 text-red-800 text-center text-xs font-bold">
                ✕ คำขอจัดงานนี้ถูกยกเลิกแล้ว
              </div>
            ) : (
              <div className="py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-center text-xs font-bold">
                ✓ งานนี้ดำเนินการเสร็จสิ้นบริบูรณ์แล้ว
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal ยืนยันการยกเลิกคำขอจัดงาน */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmCancel}
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-red-700 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                ยืนยันการยกเลิกคำขอ #{booking.code} ({booking.id})
              </h3>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              เมื่อยกเลิกแล้ว คิวศาลา <strong>{booking.locationName} ({booking.pavilionName})</strong> ในช่วงวันที่ {booking.startDate} ถึง {booking.cremationDate} จะถูกคืนให้ว่างทันที
            </p>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ระบุเหตุผลการยกเลิก</label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="เช่น ลูกค้าไม่มาติดต่อชำระเงินตามนัดหมาย / ลูกค้าขอยกเลิก"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
              >
                ปิด
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow"
              >
                ยืนยันยกเลิกคำขอ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal แก้ไขวันจัดงาน ศาลา จำนวนแขก และรายการบริการเสริมหน้างาน */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveEditDetails}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-[#E6DAC3] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  แก้ไขข้อมูลการจัดงานและบริการเสริม #{booking.code} ({booking.id})
                </h3>
                <p className="text-xs text-stone-500">ระบบจะคำนวณยอดรวมสุทธิและยอดแบ่งชำระใหม่อัตโนมัติ</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">สถานที่ / วัด</label>
                <select
                  value={editForm.locationId}
                  onChange={e => {
                    const loc = locations.find(l => l.id === e.target.value);
                    setEditForm({
                      ...editForm,
                      locationId: e.target.value,
                      pavilionId: loc?.pavilions?.[0]?.id || editForm.pavilionId
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">ศาลาบำเพ็ญกุศล</label>
                <select
                  value={editForm.pavilionId}
                  onChange={e => setEditForm({ ...editForm, pavilionId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                >
                  {(locations.find(l => l.id === editForm.locationId)?.pavilions || []).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ความจุ {p.capacity} คน)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">วันตั้งศพวันแรก</label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">วันฌาปนกิจ</label>
                <input
                  type="date"
                  value={editForm.cremationDate}
                  onChange={e => setEditForm({ ...editForm, cremationDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">วันเก็บกระดูก</label>
                <input
                  type="date"
                  value={editForm.boneCollectionDate}
                  onChange={e => setEditForm({ ...editForm, boneCollectionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  จำนวนแขก (ขั้นต่ำ {booking.baseGuests || 100})
                </label>
                <input
                  type="number"
                  min={booking.baseGuests || 100}
                  step="10"
                  value={editForm.totalGuests}
                  onChange={e => setEditForm({ ...editForm, totalGuests: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-xs text-stone-800">ปรับรายการบริการเสริม (Add-ons หน้างาน)</p>
              <div className="max-h-60 overflow-y-auto border border-stone-200 rounded-2xl divide-y divide-stone-100 p-3 space-y-1 text-xs">
                {services.filter(s => s.isActive).map(srv => {
                  const qty = editForm.addonMap[srv.id] || 0;
                  return (
                    <div key={srv.id} className="py-1.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-medium text-stone-800">{srv.name}</span>
                        <span className="text-stone-400 ml-2">({srv.price.toLocaleString()} บ./{srv.unit})</span>
                      </div>
                      <div className="inline-flex items-center border border-stone-300 rounded-lg bg-stone-50">
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm(prev => ({
                              ...prev,
                              addonMap: { ...prev.addonMap, [srv.id]: Math.max(0, (prev.addonMap[srv.id] || 0) - 1) }
                            }))
                          }
                          className="px-2.5 py-0.5 font-bold text-stone-600 hover:bg-stone-200"
                        >
                          -
                        </button>
                        <span className="px-3 py-0.5 font-bold text-stone-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm(prev => ({
                              ...prev,
                              addonMap: { ...prev.addonMap, [srv.id]: (prev.addonMap[srv.id] || 0) + 1 }
                            }))
                          }
                          className="px-2.5 py-0.5 font-bold text-stone-600 hover:bg-stone-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-xs font-bold shadow"
              >
                บันทึกการแก้ไขและคำนวณยอดใหม่
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
