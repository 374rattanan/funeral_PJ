import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import {
  INITIAL_PACKAGES,
  INITIAL_SERVICES,
  INITIAL_LOCATIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_STAFF,
  buildFullScheduleItems
} from '../data/initialData.js';
import {
  normalizeDepartmentName,
  stripDepartmentPrefix
} from '../config/siteConfig.js';

// แปลงรหัสพิธีกรรมระหว่าง Frontend ('RITUAL-01') กับ Database (1, 2, 3)
const ritualIdToInt = (ritualId) => {
  if (!ritualId) return 3;
  if (typeof ritualId === 'number') return ritualId;
  if (String(ritualId).includes('1')) return 1;
  if (String(ritualId).includes('2')) return 2;
  return 3;
};

const intToRitualId = (num) => {
  if (num === 1) return 'RITUAL-01';
  if (num === 2) return 'RITUAL-02';
  return 'RITUAL-03';
};

const intToRitualName = (num) => {
  if (num === 1) return 'แบบที่ 1 ล้านนาเต็มรูปแบบ';
  if (num === 2) return 'แบบที่ 2 ล้านนาแบบย่อ';
  return 'แบบที่ 3 New Normal (พิธีกรรมเรียบง่าย)';
};

// แปลงชื่อหมวดหมู่บริการเสริมให้ตรงกับ category_id (1..10) ในตาราง service_categories
const mapCategoryNameToId = (categoryName = '') => {
  if (categoryName.includes('เคลื่อนย้าย')) return 1;
  if (categoryName.includes('หีบศพ') || categoryName.includes('ตกแต่ง')) return 2;
  if (categoryName.includes('รดน้ำศพ')) return 3;
  if (categoryName.includes('สวดพระอภิธรรม')) return 4;
  if (categoryName.includes('เทศนา')) return 5;
  if (categoryName.includes('เคลื่อนขบวน') || categoryName.includes('เวียน')) return 6;
  if (categoryName.includes('ฌาปนกิจ')) return 7;
  if (categoryName.includes('เก็บอัฐิ')) return 8;
  if (categoryName.includes('อาหาร') || categoryName.includes('เครื่องดื่ม') || categoryName.includes('ของชำร่วย')) return 9;
  return 10;
};


// 0. ตรวจสอบบัญชีเข้าสู่ระบบกับตาราง users_auth บน Supabase

export async function authenticateUserFromSupabase(username, password) {
  if (!isSupabaseConfigured || !supabase || !username) {
    return { ok: false, offline: true };
  }
  try {
    const { data, error } = await supabase
      .from('users_auth')
      .select('user_id, username, password_hash, role, display_name, worker_id')
      .eq('username', username.trim())
      .maybeSingle();

    if (error) {
      return { ok: false, offline: true, error };
    }
    if (!data) {
      return { ok: false, message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' };
    }
    if (String(data.password_hash || '') !== String(password || '')) {
      return { ok: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    }

    let department = null;
    if (data.role === 'DEPARTMENT') {
      if (data.worker_id) {
        const { data: workerRow } = await supabase
          .from('community_workers')
          .select('department_name, full_name')
          .eq('worker_id', data.worker_id)
          .maybeSingle();
        if (workerRow?.department_name) {
          department = normalizeDepartmentName(workerRow.department_name);
        }
      }
      if (!department && data.display_name) {
        const match = data.display_name.match(/\(([^)]+)\)/);
        if (match?.[1]) {
          department = normalizeDepartmentName(match[1]);
        }
      }
    }

    return {
      ok: true,
      user: {
        id: data.user_id || `USR-${data.username}`,
        username: data.username,
        displayName: data.display_name || data.username,
        role: data.role === 'ADMIN' ? 'admin' : 'department',
        department: department || (data.role === 'DEPARTMENT' ? INITIAL_DEPARTMENTS[0] : null),
        workerId: data.worker_id || null
      }
    };
  } catch (err) {
    console.warn('Error authenticating with Supabase:', err);
    return { ok: false, offline: true, error: err };
  }
}


// 1. ดึงข้อมูลทั้งหมดจาก Supabase ตอนเปิดเว็บ (Full Read / Hydration)

export async function fetchAllDataFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [
      { data: dbDepts, error: errDepts },
      { data: dbWorkers },
      { data: dbTemples },
      { data: dbTempleImages },
      { data: dbPavilions },
      { data: dbPackages },
      { data: dbItems },
      { data: dbFunerals },
      { data: dbContacts },
      { data: dbDeceased },
      { data: dbAddons },
      { data: dbDocs },
      { data: dbPayments },
      { data: dbTasks },
      { data: dbChecklists },
      { data: dbReports }
    ] = await Promise.all([
      supabase.from('departments').select('*').order('department_id', { ascending: true }),
      supabase.from('community_workers').select('*').order('worker_id', { ascending: true }),
      supabase.from('temples').select('*').order('temple_id', { ascending: true }),
      supabase.from('temple_images').select('*'),
      // supabase.from('temple_images').select('*').order('sort_order', { ascending: true }),
      supabase.from('pavilions').select('*').order('pavilion_id', { ascending: true }),
      supabase.from('packages').select('*').order('package_id', { ascending: true }),
      supabase.from('items').select('*').order('item_id', { ascending: true }),
      supabase.from('funerals').select('*').order('funeral_id', { ascending: false }),
      supabase.from('contact_persons').select('*'),
      supabase.from('deceased_persons').select('*'),
      supabase.from('funeral_addons').select('*'),
      supabase.from('funeral_documents').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('work_tasks').select('*').order('task_seq', { ascending: true }),
      supabase.from('task_checklists').select('*').order('checklist_id', { ascending: true }),
      supabase.from('task_progress_reports').select('*').order('report_id', { ascending: true })
    ]);

    if (errDepts) {
      console.warn('⚠️ ไม่สามารถอ่านข้อมูลจาก Supabase:', errDepts.message);
      return null;
    }

    // 1.1 แปลงข้อมูลแผนก (DEPARTMENTS) ให้ตรงมาตรฐาน 8 ฝ่าย
    const activeDepts = (dbDepts || []).filter(d => d.is_active !== false);
    const departments = activeDepts.length > 0
      ? [...new Set(activeDepts.map(d => normalizeDepartmentName(d.department_name)))]
      : INITIAL_DEPARTMENTS;

    // 1.2 แปลงข้อมูลบุคลากร (COMMUNITY_WORKERS)
    const activeWorkers = (dbWorkers || []).filter(w => w.status !== 'ลบแล้ว');
    const staff = activeWorkers.length > 0
      ? activeWorkers.map((w, idx) => {
          const deptLabel = w.department_name
            ? normalizeDepartmentName(w.department_name)
            : departments[0];
          return {
            id: `STF-${String(w.worker_id || idx + 1).padStart(2, '0')}`,
            workerId: w.worker_id,
            departmentId: w.department_id || null,
            roleTitle: w.role_title || '',
            status: w.status || 'พร้อมรับงาน',
            prefix: w.prefix || 'นาง',
            fullName: w.full_name || `${w.first_name || ''} ${w.last_name || ''}`.trim(),
            department: deptLabel,
            phone: w.phone || '',
            email: w.email || '',
            address: w.address_detail || 'หมู่ 8 บ้านวิเวก',
            subdistrict: w.subdistrict || 'หนองหาร',
            district: w.district || 'สันทราย',
            province: w.province || 'เชียงใหม่',
            postalCode: w.postal_code || '50290'
          };
        })
      : INITIAL_STAFF;

    // 1.3 แปลงข้อมูลสถานที่ วัด และศาลา (TEMPLES, TEMPLE_IMAGES, PAVILIONS)
    const activeTemples = (dbTemples || []).filter(t => t.status !== 'ลบแล้ว');
    const locations = activeTemples.length > 0
      ? activeTemples.map((t, idx) => {
          const locId = `LOC-${String(t.temple_id || idx + 1).padStart(2, '0')}`;
          const imgs = (dbTempleImages || [])
            .filter(img => img.temple_id === t.temple_id)
            .map(img => img.image_url);
          const pavs = (dbPavilions || [])
            .filter(p => p.temple_id === t.temple_id && p.status !== 'ลบแล้ว')
            .map(p => ({
              id: `PAV-${String(p.pavilion_id).padStart(2, '0')}`,
              pavilionId: p.pavilion_id,
              name: p.pavilion_name,
              capacity: p.capacity || 150,
              isActive: p.status !== 'ปิดปรับปรุง'
            }));

          return {
            id: locId,
            templeId: t.temple_id,
            name: t.temple_name,
            type: t.temple_type || 'วัด',
            address: t.address_detail || 'หมู่ 8 บ้านวิเวก',
            subdistrict: t.subdistrict || 'หนองหาร',
            district: t.district || 'สันทราย',
            province: t.province || 'เชียงใหม่',
            postalCode: t.postal_code || '50290',
            phone: t.phone || '053-123456',
            mapUrl: t.map_url || '',
            details: t.additional_details || '',
            isActive: t.status !== 'ปิดใช้งาน',
            images: imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80'],
            pavilions: pavs.length > 0 ? pavs : [{ id: 'PAV-01', name: 'ศาลา 1', capacity: 200, isActive: true }]
          };
        })
      : INITIAL_LOCATIONS;

    // 1.4 แปลงข้อมูลแพ็กเกจ (PACKAGES)
    const activePackages = (dbPackages || []).filter(p => p.status !== 'ลบแล้ว' && p.status !== 'ปิดใช้งาน');
    const packages = activePackages.length > 0
      ? activePackages.map(p => {
          const templatePkg = INITIAL_PACKAGES.find(ip => ip.id === p.package_id) || INITIAL_PACKAGES[0];
          let extraMeta = {};
          if (typeof p.brochure_pdf_url === 'string' && p.brochure_pdf_url.trim().startsWith('{')) {
            try {
              extraMeta = JSON.parse(p.brochure_pdf_url);
            } catch {
              extraMeta = {};
            }
          }
          const dDays = Number(p.duration_days) || templatePkg.durationDays;
          const dNights = Number(p.duration_nights) || templatePkg.durationNights;
          return {
            ...templatePkg,
            id: p.package_id,
            name: p.package_name,
            tagline: p.overview_description ?? templatePkg.tagline,
            targetGroup: p.target_group || templatePkg.targetGroup,
            price: Number(p.base_price) || templatePkg.price,
            durationDays: dDays,
            durationNights: dNights,
            durationText: extraMeta.durationText || p.duration || `${dDays} วัน ${dNights} คืน (สวด ${dNights} คืน)`,
            baseGuests: Number(p.base_guests) || templatePkg.baseGuests,
            maxGuests: Number(p.max_guests) || templatePkg.maxGuests,
            defaultRitualId: intToRitualId(p.default_ritual_id),
            isRecommended: Boolean(p.is_recommended),
            coverImage: p.cover_image_url || templatePkg.coverImage,
            highlights: Array.isArray(extraMeta.highlights) && extraMeta.highlights.length > 0
              ? extraMeta.highlights
              : templatePkg.highlights,
            categories10: Array.isArray(extraMeta.categories10) && extraMeta.categories10.length > 0
              ? extraMeta.categories10
              : templatePkg.categories10,
            dailySchedule: templatePkg.dailySchedule || buildFullScheduleItems(p.package_id)
          };
        })
      : INITIAL_PACKAGES;

    // 1.5 แปลงข้อมูลบริการเสริม Add-ons (ITEMS where is_addon_available = true)
    const addonItems = (dbItems || []).filter(i => i.is_addon_available);
    const services = addonItems.length > 0
      ? addonItems.map((item, idx) => {
          const existingSrv = INITIAL_SERVICES.find(s => s.name === item.item_name || s.id === item.item_id) || INITIAL_SERVICES[idx % INITIAL_SERVICES.length];
          let srvMeta = {};
          if (typeof item.description === 'string' && item.description.trim().startsWith('{')) {
            try {
              srvMeta = JSON.parse(item.description);
            } catch {
              srvMeta = {};
            }
          }
          return {
            ...(existingSrv || {}),
            id: item.item_id,
            name: item.item_name,
            unit: item.unit || 'ชุด',
            price: Number(item.base_price) || 0,
            remark: srvMeta.remark !== undefined ? srvMeta.remark : (item.addon_remark || item.description || ''),
            category: srvMeta.category || existingSrv?.category || 'หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก',
            department: srvMeta.department || existingSrv?.department || 'ฝ่ายสถานที่',
            isActive: srvMeta.isActive !== undefined ? Boolean(srvMeta.isActive) : true
          };
        })
      : INITIAL_SERVICES;

    // 1.6 แปลงข้อมูลใบจองงานศพ (FUNERALS) และใบงานย่อย (WORK_TASKS)
    let bookings = [];
    let assignments = [];

    if (dbFunerals && dbFunerals.length > 0) {
      bookings = dbFunerals.map(f => {
        const contact = (dbContacts || []).find(c => c.contact_id === f.contact_id) || {};
        const deceased = (dbDeceased || []).find(d => d.deceased_id === f.deceased_id) || {};
        const pkg = packages.find(p => p.id === f.package_id) || INITIAL_PACKAGES.find(p => p.id === f.package_id) || packages[0];
        const loc = locations.find(l => l.templeId === f.temple_id) || locations[0];
        const pav = (loc?.pavilions || []).find(p => p.pavilionId === f.pavilion_id) || loc?.pavilions?.[0] || { id: 'PAV-01', name: 'ศาลา 1' };

        const fDocs = (dbDocs || []).filter(doc => doc.funeral_id === f.funeral_id);
        const idCardDoc = fDocs.find(d => d.doc_type.includes('ผู้ติดต่อ'))?.file_url || null;
        const deathCertDoc = fDocs.find(d => d.doc_type.includes('ผู้เสียชีวิต') || d.doc_type.includes('มรณบัตร'))?.file_url || null;

        const fPayments = (dbPayments || []).filter(pay => pay.funeral_id === f.funeral_id);
        const pay1 = fPayments.find(p => p.installment_no === 1);
        const pay2 = fPayments.find(p => p.installment_no === 2);

        const fAddons = (dbAddons || []).filter(a => a.funeral_id === f.funeral_id).map(a => {
          const itemObj = (dbItems || []).find(i => i.item_id === a.item_id);
          return {
            id: a.item_id,
            name: itemObj?.item_name || a.item_id,
            qty: a.qty,
            unit: itemObj?.unit || 'ชุด',
            price: Number(a.unit_price) || 0,
            total: Number(a.price) || 0
          };
        });

        const bookingId = f.req_number || f.funeral_code || `BW-${String(f.funeral_id).padStart(5, '0')}`;
        const effectiveStatus = ['รออนุมัติ', 'กำลังดำเนินงาน', 'เสร็จสิ้น', 'ยกเลิก'].includes(f.rejection_or_revision_note)
          ? f.rejection_or_revision_note
          : (f.status || 'รออนุมัติ');
        const pay1Pct = pay1 ? Number(pay1.installment_percent ?? pay1.percentage ?? f.installment1_percent ?? 100) : (Number(f.installment1_percent) || 100);
        const isInstallmentPlan = f.payment_plan === 'installment' || (Boolean(pay2) && Number(pay2.paid_amount) > 0) || pay1Pct < 100;

        return {
          id: bookingId,
          funeralId: f.funeral_id,
          reqNumber: bookingId,
          code: f.funeral_code || `A${String(f.funeral_id).padStart(3, '0')}`,
          createdAt: f.created_at || new Date().toISOString(),
          packageId: f.package_id || pkg.id,
          packageName: pkg.name,
          packagePrice: Number(f.package_amount) || pkg.price,
          durationDays: Number(f.duration_days) || pkg.durationDays,
          durationNights: pkg?.durationNights ?? Math.max(0, (Number(f.duration_days) || 3) - 1),
          baseGuests: Number(f.base_guests) || pkg.baseGuests,
          extraGuests: Number(f.extra_guests) || 0,
          extraGuestsCost: (Number(f.extra_guests) || 0) * 150,
          totalGuests: Number(f.expected_guests) || pkg.baseGuests,
          ritualId: intToRitualId(f.selected_ritual_id),
          ritualName: intToRitualName(f.selected_ritual_id),
          ritualUpgradePrice: Number(f.ritual_upgrade_amount) || 0,
          locationId: loc?.id || 'LOC-01',
          locationName: loc?.name || 'วัดวิเวกวนาราม',
          pavilionId: pav?.id || 'PAV-01',
          pavilionName: pav?.name || 'ศาลา 1',
          startDate: f.start_date,
          cremationDate: f.cremation_date || f.end_date || f.start_date,
          boneCollectionDate: f.bone_collection_date || f.end_date || f.start_date,
          appointmentDate: f.appointment_date || f.start_date,
          appointmentTime: f.appointment_time || '09:00 - 10:00 น.',
          paymentOption: isInstallmentPlan ? 'INSTALLMENT' : 'FULL',
          installment1Percent: isInstallmentPlan ? pay1Pct : 100,
          installment1Amount: pay1 ? Number(pay1.paid_amount) : Math.round((Number(f.total_amount) * (isInstallmentPlan ? pay1Pct : 100)) / 100),
          installment1Paid: pay1 ? pay1.payment_status === 'ชำระเงินแล้ว' : false,
          installment1PaidAt: pay1?.paid_at ? new Date(pay1.paid_at).toLocaleDateString('th-TH') : null,
          installment1PaidAtIso: pay1?.paid_at || null,
          installment1Slip: pay1?.payment_proof_url || null,
          installment2Amount: isInstallmentPlan
            ? (pay2 ? Number(pay2.paid_amount) : Number(f.total_amount) - Math.round((Number(f.total_amount) * pay1Pct) / 100))
            : 0,
          installment2Paid: isInstallmentPlan
            ? (pay2 ? pay2.payment_status === 'ชำระเงินแล้ว' : false)
            : (pay1 ? pay1.payment_status === 'ชำระเงินแล้ว' : false),
          installment2PaidAt: pay2?.paid_at ? new Date(pay2.paid_at).toLocaleDateString('th-TH') : null,
          installment2PaidAtIso: pay2?.paid_at || null,
          installment2Slip: isInstallmentPlan ? (pay2?.payment_proof_url || null) : null,
          addons: fAddons,
          addonsTotal: Number(f.addons_amount) || 0,
          netTotal: Number(f.total_amount) || 0,
          status: effectiveStatus,
          cancelReason: f.close_summary && effectiveStatus === 'ยกเลิก' ? f.close_summary : '',
          specialNote: f.special_instructions || '',
          contact: {
            contactId: contact.contact_id,
            prefix: contact.prefix || 'คุณ',
            fullName: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'ผู้ติดต่อ',
            relationship: f.contact_relationship || 'ญาติ',
            phone: contact.phone || '',
            backupPhone: contact.backup_phone || '',
            lineId: contact.line_id || '',
            email: contact.email || '',
            address: contact.address_detail || '',
            subdistrict: contact.subdistrict || 'หนองหาร',
            district: contact.district || 'สันทราย',
            province: contact.province || 'เชียงใหม่',
            postalCode: contact.postal_code || '50290',
            idCardDoc
          },
          deceased: {
            deceasedId: deceased.deceased_id,
            prefix: deceased.prefix || 'คุณ',
            fullName: `${deceased.first_name || ''} ${deceased.last_name || ''}`.trim() || 'ผู้วายชนม์',
            nationalId: deceased.national_id || '',
            gender: deceased.gender || 'ชาย',
            birthDate: deceased.birth_date || '',
            deathDate: deceased.death_date || f.start_date,
            age: deceased.age || 70,
            placeOfDeath: deceased.place_of_death || 'โรงพยาบาล',
            deathCertDoc
          }
        };
      });

      // แปลงใบงานแผนก (WORK_TASKS)
      assignments = (dbTasks || []).map(t => {
        const parentFuneral = (dbFunerals || []).find(f => f.funeral_id === t.funeral_id);
        const bookingId = parentFuneral
          ? (parentFuneral.req_number || parentFuneral.funeral_code || `BW-${String(parentFuneral.funeral_id).padStart(5, '0')}`)
          : t.task_id.split('-TSK-')[0];
        const matchedBooking = bookings.find(b => b.id === bookingId || b.funeralId === t.funeral_id);
        const normalizedDept = normalizeDepartmentName(t.department_name || 'ฝ่ายสถานที่');
        const worker = staff.find(s => s.workerId === t.primary_worker_id)
          || staff.find(s => normalizeDepartmentName(s.department) === normalizedDept)
          || staff[0];
        const checklists = (dbChecklists || [])
          .filter(c => c.task_id === t.task_id)
          .map((c, idx) => ({
            id: `chk-${c.checklist_id || idx + 1}`,
            checklistId: c.checklist_id,
            label: String(c.label || '').replace(/ประกอบ仪式/g, 'ประกอบพิธี'),
            isChecked: Boolean(c.is_checked),
            completedTime: c.completed_time || ''
          }));
        const reports = (dbReports || []).filter(r => r.task_id === t.task_id);
        const photos = reports.map(r => r.photo_url).filter(Boolean);
        const latestReport = reports[reports.length - 1];
        const venueDisplay = t.location_display
          || (matchedBooking ? `${matchedBooking.locationName} (${matchedBooking.pavilionName})` : 'วัดวิเวกวนาราม (ศาลา 1)');
        const dateRange = matchedBooking?.startDate
          ? `${matchedBooking.startDate}${matchedBooking.cremationDate && matchedBooking.cremationDate !== matchedBooking.startDate ? ` ถึง ${matchedBooking.cremationDate}` : ''}`
          : (t.work_date || '');

        return {
          id: t.task_id,
          bookingId,
          bookingCode: matchedBooking?.code || parentFuneral?.funeral_code || bookingId,
          bookingStatus: matchedBooking?.status || parentFuneral?.status || 'รออนุมัติ',
          deceasedName: matchedBooking
            ? `${matchedBooking.deceased?.prefix || ''}${matchedBooking.deceased?.fullName || ''}`.trim()
            : 'ผู้วายชนม์',
          hostName: matchedBooking
            ? `${matchedBooking.contact?.prefix || ''}${matchedBooking.contact?.fullName || ''}`.trim()
            : 'เจ้าภาพ',
          hostPhone: matchedBooking?.contact?.phone || '',
          funeralId: t.funeral_id,
          seq: t.task_seq || 1,
          title: t.title,
          department: normalizedDept,
          staffId: worker?.id || 'STF-01',
          staffName: worker?.fullName || 'เจ้าหน้าที่ชุมชน',
          staffPhone: worker?.phone || '',
          workDate: t.work_date || parentFuneral?.start_date || '',
          workTime: t.work_time || '09:00 น.',
          dateRangeText: dateRange,
          locationName: venueDisplay,
          locationDisplay: venueDisplay,
          note: t.notes || '',
          status: t.status || 'ยังไม่ได้มอบหมาย',
          currentStep: Number(t.current_step) || 1,
          acceptedAt: t.acknowledged_at
            ? new Date(t.acknowledged_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
            : null,
          checklist: checklists,
          photos,
          fieldNote: latestReport?.description || t.review_feedback || '',
          completedAt: t.status === 'เสร็จสิ้น' && latestReport?.submitted_at
            ? new Date(latestReport.submitted_at).toLocaleDateString('th-TH')
            : null
        };
      });
    }

    // 1.7 ดึงข้อมูลใบจองสำรอง (กรณีตาราง funerals ติด Trigger 21000 ก่อนแก้ไข SQL)
    const fallbackBookingItems = (dbItems || []).filter(
      i => !i.is_addon_available && String(i.item_id || '').startsWith('BK-FALLBACK-')
    );
    for (const fb of fallbackBookingItems) {
      try {
        const parsed = JSON.parse(fb.description || '{}');
        if (parsed?.booking?.id) {
          const existingIdx = bookings.findIndex(b => b.id === parsed.booking.id);
          if (existingIdx >= 0) {
            bookings[existingIdx] = { ...bookings[existingIdx], ...parsed.booking };
          } else {
            bookings.unshift(parsed.booking);
          }
        }
        if (Array.isArray(parsed?.tasks) && parsed.tasks.length > 0) {
          const fbTaskIds = new Set(parsed.tasks.map(t => t.id));
          assignments = [
            ...parsed.tasks,
            ...assignments.filter(a => !fbTaskIds.has(a.id))
          ];
        }
      } catch {
        // ignore malformed fallback json
      }
    }

    return {
      departments,
      staff,
      locations,
      packages,
      services,
      bookings,
      assignments,
      hasBookingsInDb: bookings.length > 0
    };
  } catch (err) {
    console.warn('Error fetching all data from Supabase:', err);
    return null;
  }
}

// ============================================================================
// 2. ซิงก์ข้อมูลใบจองตัวอย่างเริ่มต้นเข้า Supabase อัตโนมัติ (กรณีตาราง funerals ว่างเปล่า)
// ============================================================================
let seedingBookingsPromise = null;

export async function seedInitialBookingsToSupabaseIfEmpty(initialBookings, buildInitialAssignmentsFn) {
  if (!isSupabaseConfigured || !supabase) return;
  if (seedingBookingsPromise) return seedingBookingsPromise;

  seedingBookingsPromise = (async () => {
    try {
      const { count, error } = await supabase
        .from('funerals')
        .select('*', { count: 'exact', head: true });
      if (error || (count && count > 0)) return;

      console.log('🌱 ตาราง funerals ใน Supabase ยังว่างอยู่ กำลังบันทึกข้อมูลเริ่มต้นลง Supabase...');
      for (const b of initialBookings) {
        const tasks = buildInitialAssignmentsFn([b]);
        await syncNewBookingToSupabase(b, tasks);
      }
      console.log('✅ บันทึกข้อมูลใบจองตัวอย่างเข้าสู่ Supabase ครบถ้วน!');
    } catch (err) {
      console.warn('Seed initial bookings warning:', err);
    } finally {
      seedingBookingsPromise = null;
    }
  })();

  return seedingBookingsPromise;
}

// ============================================================================
// 3. ซิงก์คำขอจัดงานใหม่จากหน้า 4-Step Booking ลงตารางตาม ER Diagram บน Supabase
// ============================================================================
export async function syncNewBookingToSupabase(booking, tasks) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const reqNum = booking.reqNumber || booking.id;
    const isInstallment = booking.paymentOption === 'INSTALLMENT' || booking.paymentPlan === 'installment';
    const pct1 = isInstallment ? (Number(booking.installment1Percent) || 25) : 100;

    // ตรวจสอบว่ามีใบจองนี้อยู่แล้วหรือไม่เพื่อกันการแทรก contact/deceased ซ้ำ
    const { data: existingFuneral } = await supabase
      .from('funerals')
      .select('funeral_id, contact_id, deceased_id')
      .eq('req_number', reqNum)
      .maybeSingle();

    // 1. บันทึกข้อมูลผู้ติดต่อ (CONTACT_PERSONS)
    let contactId = existingFuneral?.contact_id || null;
    if (!contactId) {
      const contactNameParts = (booking.contact?.fullName || '').trim().split(/\s+/);
      const contactFirst = contactNameParts[0] || booking.contact?.fullName || '-';
      const contactLast = contactNameParts.slice(1).join(' ') || '-';

      const { data: contactRow, error: contactErr } = await supabase
        .from('contact_persons')
        .insert({
          prefix: booking.contact?.prefix || '',
          first_name: contactFirst,
          last_name: contactLast,
          phone: booking.contact?.phone || '',
          backup_phone: booking.contact?.backupPhone || '',
          line_id: booking.contact?.lineId || '',
          email: booking.contact?.email || '',
          address_detail: booking.contact?.address || '',
          subdistrict: booking.contact?.subdistrict || 'หนองหาร',
          district: booking.contact?.district || 'สันทราย',
          province: booking.contact?.province || 'เชียงใหม่',
          postal_code: booking.contact?.postalCode || '50290'
        })
        .select('contact_id')
        .single();

      if (contactErr) console.warn('Supabase contact_persons insert warning:', contactErr.message);
      contactId = contactRow?.contact_id || null;
    }

    // 2. บันทึกข้อมูลผู้เสียชีวิต (DECEASED_PERSONS)
    let deceasedId = existingFuneral?.deceased_id || null;
    if (!deceasedId) {
      const deceasedNameParts = (booking.deceased?.fullName || '').trim().split(/\s+/);
      const deceasedFirst = deceasedNameParts[0] || booking.deceased?.fullName || '-';
      const deceasedLast = deceasedNameParts.slice(1).join(' ') || '-';

      const { data: deceasedRow, error: deceasedErr } = await supabase
        .from('deceased_persons')
        .insert({
          prefix: booking.deceased?.prefix || '',
          first_name: deceasedFirst,
          last_name: deceasedLast,
          national_id: booking.deceased?.nationalId || '',
          gender: booking.deceased?.gender || '',
          birth_date: booking.deceased?.birthDate || null,
          age: Number(booking.deceased?.age) || null,
          death_date: booking.deceased?.deathDate || null,
          place_of_death: booking.deceased?.placeOfDeath || ''
        })
        .select('deceased_id')
        .single();

      if (deceasedErr) console.warn('Supabase deceased_persons insert warning:', deceasedErr.message);
      deceasedId = deceasedRow?.deceased_id || null;
    }

    // แปลงรหัสวัดและศาลาเป็นตัวเลข FK
    const templeIdInt = Number(String(booking.locationId || 'LOC-01').replace(/\D/g, '')) || 1;
    const pavilionIdInt = Number(String(booking.pavilionId || 'PAV-01').replace(/\D/g, '')) || 1;
    const selectedRitualInt = ritualIdToInt(booking.ritualId);

    // 3. บันทึกใบจองงานศพหลัก (FUNERALS) รวมวันนัดหมายและแผนการชำระเงินครบถ้วน
    const { data: funeralRow, error: funeralErr } = await supabase
      .from('funerals')
      .upsert({
        funeral_code: booking.code,
        req_number: reqNum,
        contact_id: contactId,
        contact_relationship: booking.contact?.relationship || '',
        deceased_id: deceasedId,
        package_id: booking.packageId || 'PKG-01',
        selected_ritual_id: selectedRitualInt,
        temple_id: templeIdInt,
        pavilion_id: pavilionIdInt,
        start_date: booking.startDate,
        cremation_date: booking.cremationDate || booking.endDate || booking.startDate,
        bone_collection_date: booking.boneCollectionDate || null,
        end_date: booking.endDate || booking.boneCollectionDate || booking.cremationDate || booking.startDate,
        duration_days: Number(booking.durationDays) || 3,
        base_guests: Number(booking.baseGuests) || 50,
        extra_guests: Number(booking.extraGuests) || 0,
        expected_guests: Number(booking.totalGuests) || 50,
        package_amount: Number(booking.packagePrice) || 0,
        ritual_upgrade_amount: Number(booking.ritualUpgradePrice) || 0,
        addons_amount: Number(booking.addonsTotal) || 0,
        total_amount: Number(booking.netTotal || booking.totalAmount) || 0,
        appointment_date: booking.appointmentDate || booking.startDate,
        appointment_time: booking.appointmentTime || '09:00 - 10:00 น.',
        payment_plan: isInstallment ? 'installment' : 'full',
        installment1_percent: pct1,
        status: booking.status || 'รออนุมัติ',
        special_instructions: booking.specialNote || ''
      }, { onConflict: 'req_number' })
      .select('funeral_id')
      .single();

    if (funeralErr) {
      console.warn('Supabase funerals insert warning (saving to fallback store in Supabase):', funeralErr.message);
      await saveFallbackBookingInSupabase(booking, tasks);
      return;
    }

    const funeralId = funeralRow.funeral_id;

    // 4. บันทึกรายการบริการเสริมที่สั่งเพิ่ม (ลบของเดิมก่อนกันซ้ำ และไม่เขียนทับหมวดหมู่ใน items)
    await supabase.from('funeral_addons').delete().eq('funeral_id', funeralId);
    if (Array.isArray(booking.addons) && booking.addons.length > 0) {
      for (const addon of booking.addons) {
        const { data: existingItem } = await supabase
          .from('items')
          .select('item_id')
          .eq('item_id', addon.id)
          .maybeSingle();

        if (!existingItem) {
          await supabase.from('items').insert({
            item_id: addon.id,
            category_id: 10,
            item_code: addon.id,
            item_name: addon.name,
            unit: addon.unit || 'ชุด',
            base_price: Number(addon.price) || 0,
            is_addon_available: true
          });
        }

        await supabase.from('funeral_addons').insert({
          funeral_id: funeralId,
          item_id: addon.id,
          qty: Number(addon.qty) || 1,
          unit_price: Number(addon.price) || 0,
          price: Number(addon.total) || (Number(addon.price) * Number(addon.qty)) || 0
        });
      }
    }

    // 5. บันทึกเอกสารแนบ (ลบของเดิมก่อนกันซ้ำ)
    const docsToInsert = [];
    if (booking.contact?.idCardDoc) {
      docsToInsert.push({
        funeral_id: funeralId,
        doc_type: 'สำเนาบัตรประชาชนผู้ติดต่อ',
        file_url: booking.contact.idCardDoc
      });
    }
    if (booking.deceased?.deathCertDoc) {
      docsToInsert.push({
        funeral_id: funeralId,
        doc_type: 'สำเนาบัตรประชาชนผู้เสียชีวิต/ใบมรณบัตร',
        file_url: booking.deceased.deathCertDoc
      });
    }
    if (docsToInsert.length > 0) {
      await supabase.from('funeral_documents').delete().eq('funeral_id', funeralId);
      await supabase.from('funeral_documents').insert(docsToInsert);
    }

    // 6. บันทึกงวดการชำระเงิน (PAYMENTS)
    const paymentsToInsert = [
      {
        payment_id: `PAY-${booking.id}-1`,
        funeral_id: funeralId,
        installment_no: 1,
        installment_percent: pct1,
        paid_amount: Number(booking.installment1Amount) || Number(booking.netTotal) || 0,
        payment_status: booking.installment1Paid ? 'ชำระเงินแล้ว' : 'รอดำเนินการ',
        payment_proof_url: booking.installment1Slip || null,
        paid_at: booking.installment1Paid ? (booking.installment1PaidAtIso || new Date().toISOString()) : null
      }
    ];
    if (isInstallment) {
      paymentsToInsert.push({
        payment_id: `PAY-${booking.id}-2`,
        funeral_id: funeralId,
        installment_no: 2,
        installment_percent: 100 - pct1,
        paid_amount: Number(booking.installment2Amount) || 0,
        payment_status: booking.installment2Paid ? 'ชำระเงินแล้ว' : 'รอดำเนินการ',
        payment_proof_url: booking.installment2Slip || null,
        paid_at: booking.installment2Paid ? (booking.installment2PaidAtIso || new Date().toISOString()) : null
      });
    }
    await supabase.from('payments').upsert(paymentsToInsert, { onConflict: 'payment_id' });

    // 7. บันทึกไทม์ไลน์ 8 ขั้นตอน (ลบของเดิมก่อนกันซ้ำ)
    const timelineSteps = [
      { step_no: 1, title: 'รับคำขอและตรวจสอบเอกสารสำคัญ', responsible_info: 'ผู้ดูแลระบบกลาง' },
      { step_no: 2, title: 'จัดเตรียมศาลา โต๊ะ เก้าอี้ เต็นท์ และไฟฟ้า', responsible_info: 'ฝ่ายสถานที่ และฝ่ายเครื่องเสียงและไฟฟ้า' },
      { step_no: 3, title: 'เคลื่อนย้ายร่างและบรรจุหีบศพ/โลงเย็น', responsible_info: 'ฝ่ายยานพาหนะ และฝ่ายหีบศพและอุปกรณ์' },
      { step_no: 4, title: 'จัดดอกไม้หน้าหีบศพ กรอบรูป และปราสาทศพ', responsible_info: 'ฝ่ายดอกไม้และตกแต่ง' },
      { step_no: 5, title: 'เตรียมขันตั้ง สวยดอก ผ้าบังสุกุล และสังฆทาน', responsible_info: 'ฝ่ายหัตถกรรมและของชำร่วย' },
      { step_no: 6, title: 'บริการน้ำดื่ม อาหารว่าง และโรงครัวตลอดงาน', responsible_info: 'ฝ่ายอาหารและเครื่องดื่ม' },
      { step_no: 7, title: 'ประกอบพิธีสวดพระอภิธรรมและพิธีล้านนา', responsible_info: 'ฝ่ายพิธีการและศาสนา' },
      { step_no: 8, title: 'พิธีเคลื่อนขบวน ฌาปนกิจ และเก็บอัฐิ', responsible_info: 'ทุกฝ่ายร่วมส่งมอบงาน' }
    ];
    await supabase.from('funeral_timelines').delete().eq('funeral_id', funeralId);
    await supabase.from('funeral_timelines').insert(
      timelineSteps.map(s => ({
        funeral_id: funeralId,
        step_no: s.step_no,
        title: s.title,
        responsible_info: s.responsible_info,
        status: booking.status === 'เสร็จสิ้น' ? 'เสร็จสิ้น' : booking.status === 'กำลังดำเนินงาน' && s.step_no <= 2 ? 'เสร็จสิ้น' : 'รอดำเนินงาน',
        display_date: booking.startDate
      }))
    );

    // 8. บันทึกใบงานแผนก (WORK_TASKS), เช็กลิสต์ย่อย (TASK_CHECKLISTS), และรูปหน้างาน (TASK_PROGRESS_REPORTS)
    if (Array.isArray(tasks) && tasks.length > 0) {
      for (const t of tasks) {
        const normalizedDept = normalizeDepartmentName(t.department);
        const { error: taskErr } = await supabase.from('work_tasks').upsert({
          task_id: t.id,
          funeral_id: funeralId,
          task_seq: t.seq || 1,
          title: t.title,
          department_name: normalizedDept,
          work_date: t.workDate || booking.startDate,
          work_time: t.workTime || '09:00 น.',
          location_display: t.locationDisplay || t.locationName || '',
          status: t.status || 'ยังไม่ได้มอบหมาย',
          current_step: t.currentStep || 1,
          notes: t.note || ''
        }, { onConflict: 'task_id' });

        if (!taskErr && Array.isArray(t.checklist) && t.checklist.length > 0) {
          await supabase.from('task_checklists').delete().eq('task_id', t.id);
          await supabase.from('task_checklists').insert(
            t.checklist.map(c => ({
              task_id: t.id,
              label: c.label,
              is_checked: Boolean(c.isChecked),
              completed_time: c.completedTime || null
            }))
          );
        }

        if (!taskErr && Array.isArray(t.photos) && t.photos.length > 0) {
          await supabase.from('task_progress_reports').delete().eq('task_id', t.id);
          await supabase.from('task_progress_reports').insert(
            t.photos.map(photoUrl => ({
              task_id: t.id,
              photo_url: photoUrl,
              description: t.fieldNote || `รายงานภาพหน้างาน ${t.title}`,
              submitted_by: t.staffName || normalizedDept
            }))
          );
        }
      }
    }
  } catch (err) {
    console.warn('Error syncing booking to Supabase:', err);
  }
}

// Helper บันทึก/อัปเดตใบจองสำรองลง Supabase กรณีตาราง funerals ติด Trigger 21000
async function saveFallbackBookingInSupabase(booking, tasks) {
  if (!supabase || !booking?.id) return;
  try {
    const fbId = `BK-FALLBACK-${booking.id}`;
    const { data: existing } = await supabase
      .from('items')
      .select('description')
      .eq('item_id', fbId)
      .maybeSingle();

    let prev = {};
    if (existing?.description) {
      try {
        prev = JSON.parse(existing.description);
      } catch {
        prev = {};
      }
    }

    const nextPayload = {
      booking: { ...(prev.booking || {}), ...booking },
      tasks: tasks || prev.tasks || []
    };

    await supabase.from('items').upsert({
      item_id: fbId,
      category_id: 1,
      item_code: booking.code || booking.id,
      item_name: `FALLBACK_${booking.id}`,
      description: JSON.stringify(nextPayload),
      unit: 'งาน',
      base_price: Number(booking.netTotal) || 0,
      is_addon_available: false
    }, { onConflict: 'item_id' });
  } catch (err) {
    console.warn('Fallback booking save warning:', err);
  }
}

async function updateFallbackBookingIfExists(bookingId, updaterFn) {
  if (!supabase || !bookingId) return;
  try {
    const fbId = `BK-FALLBACK-${bookingId}`;
    const { data: existing } = await supabase
      .from('items')
      .select('description')
      .eq('item_id', fbId)
      .maybeSingle();
    if (!existing?.description) return;

    const parsed = JSON.parse(existing.description);
    const updated = updaterFn(parsed);
    if (!updated) return;

    await supabase
      .from('items')
      .update({
        description: JSON.stringify(updated),
        base_price: Number(updated.booking?.netTotal) || 0
      })
      .eq('item_id', fbId);
  } catch (err) {
    console.warn('Fallback booking update warning:', err);
  }
}

// Helper ค้นหา funeral_id จาก req_number หรือ funeral_code
async function resolveFuneralId(bookingOrId) {
  if (!supabase) return null;
  if (typeof bookingOrId === 'object' && bookingOrId?.funeralId) {
    return bookingOrId.funeralId;
  }
  const reqNum = typeof bookingOrId === 'object'
    ? (bookingOrId.reqNumber || bookingOrId.id)
    : bookingOrId;
  if (!reqNum) return null;
  const { data } = await supabase
    .from('funerals')
    .select('funeral_id')
    .or(`req_number.eq.${reqNum},funeral_code.eq.${reqNum}`)
    .maybeSingle();
  return data?.funeral_id || null;
}

// Helper อัปเดตสถานะในตาราง funerals พร้อม Fallback กรณีติด Trigger 21000
async function safeUpdateFuneralStatus(reqNum, nextStatus, extraCols = {}) {
  if (!supabase || !reqNum) return null;
  const { data, error } = await supabase
    .from('funerals')
    .update({
      status: nextStatus,
      rejection_or_revision_note: null,
      ...extraCols
    })
    .eq('req_number', reqNum)
    .select('funeral_id')
    .maybeSingle();

  if (error) {
    // กรณีฐานข้อมูลยังไม่ได้อัปเดต Trigger ให้บันทึกสถานะลงคอลัมน์สำรองแทน
    const fallback = await supabase
      .from('funerals')
      .update({
        rejection_or_revision_note: nextStatus,
        ...extraCols
      })
      .eq('req_number', reqNum)
      .select('funeral_id')
      .maybeSingle();
    return fallback.data?.funeral_id || null;
  }
  return data?.funeral_id || null;
}

// ============================================================================
// 4. ซิงก์การชำระเงิน การอนุมัติคำขอ และการปิดจบงานบริบูรณ์ (Admin Actions)
// ============================================================================
export async function syncApprovalAndPaymentToSupabase(booking) {
  if (!isSupabaseConfigured || !supabase || !booking) return;
  try {
    const reqNum = booking.reqNumber || booking.id;
    await updateFallbackBookingIfExists(reqNum, prev => ({
      ...prev,
      booking: { ...(prev.booking || {}), ...booking },
      tasks: (prev.tasks || []).map(t =>
        booking.status === 'กำลังดำเนินงาน' && t.status === 'ยังไม่ได้มอบหมาย'
          ? { ...t, status: 'มอบหมายแล้ว' }
          : t
      )
    }));

    const isInstallment = booking.paymentOption === 'INSTALLMENT';
    const pct1 = isInstallment ? (Number(booking.installment1Percent) || 25) : 100;
    const planStr = isInstallment ? 'installment' : 'full';

    let funeralId = await safeUpdateFuneralStatus(reqNum, booking.status, {
      installment1_percent: pct1,
      payment_plan: planStr
    });
    if (!funeralId) {
      funeralId = await resolveFuneralId(booking);
    }
    if (!funeralId) return;

    // อัปเดตงวดที่ 1 (คงเวลา paid_at เดิมหากเคยบันทึกไว้แล้ว)
    const { error: pay1Err } = await supabase
      .from('payments')
      .upsert({
        payment_id: `PAY-${booking.id}-1`,
        funeral_id: funeralId,
        installment_no: 1,
        installment_percent: pct1,
        paid_amount: Number(booking.installment1Amount) || 0,
        payment_proof_url: booking.installment1Slip || null,
        payment_status: booking.installment1Paid ? 'ชำระเงินแล้ว' : 'รอดำเนินการ',
        paid_at: booking.installment1Paid ? (booking.installment1PaidAtIso || new Date().toISOString()) : null
      }, { onConflict: 'payment_id' });

    if (pay1Err) {
      console.warn('Supabase payments installment 1 upsert warning:', pay1Err.message);
    }

    // อัปเดตงวดที่ 2 เฉพาะแผนแบ่งชำระ 2 งวด (ห้ามสร้างแถวงวด 2 ให้ใบจองจ่ายเต็ม FULL)
    if (isInstallment) {
      const { error: pay2Err } = await supabase
        .from('payments')
        .upsert({
          payment_id: `PAY-${booking.id}-2`,
          funeral_id: funeralId,
          installment_no: 2,
          installment_percent: 100 - pct1,
          paid_amount: Number(booking.installment2Amount) || 0,
          payment_proof_url: booking.installment2Slip || null,
          payment_status: booking.installment2Paid ? 'ชำระเงินแล้ว' : 'รอดำเนินการ',
          paid_at: booking.installment2Paid ? (booking.installment2PaidAtIso || new Date().toISOString()) : null
        }, { onConflict: 'payment_id' });

      if (pay2Err) {
        console.warn('Supabase payments installment 2 upsert warning:', pay2Err.message);
      }
    }

    // ถ้าอนุมัติแล้ว ให้เปลี่ยนสถานะใบงานแผนกที่ยังไม่ได้มอบหมายเป็น 'มอบหมายแล้ว' และอัปเดตไทม์ไลน์ขั้นที่ 1
    if (booking.status === 'กำลังดำเนินงาน' && funeralId) {
      await supabase
        .from('work_tasks')
        .update({ status: 'มอบหมายแล้ว' })
        .eq('funeral_id', funeralId)
        .eq('status', 'ยังไม่ได้มอบหมาย');

      await supabase
        .from('funeral_timelines')
        .update({ status: 'เสร็จสิ้น' })
        .eq('funeral_id', funeralId)
        .eq('step_no', 1);
    }
  } catch (err) {
    console.warn('Error syncing payment/approval to Supabase:', err);
  }
}

export async function syncCompleteEntireBookingToSupabase(bookingId) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await updateFallbackBookingIfExists(bookingId, prev => ({
      ...prev,
      booking: { ...(prev.booking || {}), status: 'เสร็จสิ้น' }
    }));

    let funeralId = await safeUpdateFuneralStatus(bookingId, 'เสร็จสิ้น', {
      close_summary: 'ส่งมอบงานครบทุกแผนกและรับชำระเงินครบถ้วนบริบูรณ์'
    });
    if (!funeralId) {
      funeralId = await resolveFuneralId(bookingId);
    }

    if (funeralId) {
      await Promise.all([
        supabase
          .from('funeral_timelines')
          .update({ status: 'เสร็จสิ้น' })
          .eq('funeral_id', funeralId),
        supabase
          .from('work_tasks')
          .update({ status: 'เสร็จสิ้น', current_step: 4 })
          .eq('funeral_id', funeralId)
          .neq('status', 'เสร็จสิ้น')
      ]);
    }
  } catch (err) {
    console.warn('Error completing entire booking in Supabase:', err);
  }
}

export async function syncCancelBookingToSupabase(bookingId, cancelReason = 'ยกเลิกคำขอจัดงานโดยผู้ดูแลระบบ') {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await updateFallbackBookingIfExists(bookingId, prev => ({
      ...prev,
      booking: { ...(prev.booking || {}), status: 'ยกเลิก', cancelReason }
    }));

    let funeralId = await safeUpdateFuneralStatus(bookingId, 'ยกเลิก', {
      close_summary: cancelReason
    });
    if (!funeralId) {
      funeralId = await resolveFuneralId(bookingId);
    }

    if (funeralId) {
      await Promise.all([
        supabase
          .from('work_tasks')
          .update({ status: 'ยกเลิก' })
          .eq('funeral_id', funeralId),
        supabase
          .from('funeral_timelines')
          .update({ status: 'ยกเลิก' })
          .eq('funeral_id', funeralId)
      ]);
    }
  } catch (err) {
    console.warn('Error cancelling booking in Supabase:', err);
  }
}

export async function syncUpdateBookingDetailsToSupabase(booking) {
  if (!isSupabaseConfigured || !supabase || !booking) return;
  try {
    const reqNum = booking.reqNumber || booking.id;
    await updateFallbackBookingIfExists(reqNum, prev => ({
      ...prev,
      booking: { ...(prev.booking || {}), ...booking }
    }));

    const templeId = Number(String(booking.locationId || 'LOC-01').replace(/\D/g, '')) || 1;
    const pavilionId = Number(String(booking.pavilionId || 'PAV-01').replace(/\D/g, '')) || 1;

    const { data: funeralRow, error: updErr } = await supabase
      .from('funerals')
      .update({
        temple_id: templeId,
        pavilion_id: pavilionId,
        start_date: booking.startDate,
        end_date: booking.boneCollectionDate || booking.cremationDate,
        cremation_date: booking.cremationDate,
        bone_collection_date: booking.boneCollectionDate || booking.cremationDate,
        expected_guests: Number(booking.totalGuests) || 100,
        extra_guests: Number(booking.extraGuests) || 0,
        addons_amount: Number(booking.addonsTotal) || 0,
        total_amount: Number(booking.netTotal) || 0
      })
      .eq('req_number', reqNum)
      .select('funeral_id')
      .maybeSingle();

    if (updErr) {
      console.warn('Supabase funerals details update warning:', updErr.message);
    }

    const funeralId = funeralRow?.funeral_id || await resolveFuneralId(booking);
    if (funeralId) {
      if (Array.isArray(booking.addons)) {
        await supabase.from('funeral_addons').delete().eq('funeral_id', funeralId);
        for (const a of booking.addons) {
          await supabase.from('funeral_addons').insert({
            funeral_id: funeralId,
            item_id: a.id,
            qty: Number(a.qty) || 1,
            unit_price: Number(a.price) || 0,
            price: Number(a.total) || (Number(a.price) * Number(a.qty)) || 0
          });
        }
      }
      // อัปเดตวันจัดงานและสถานที่ในใบงานแผนก (work_tasks) ให้ตรงกันด้วย
      const nextLocationDisplay = `${booking.locationName || ''} (${booking.pavilionName || ''})`.trim();
      await supabase
        .from('work_tasks')
        .update({
          work_date: booking.startDate,
          location_display: nextLocationDisplay
        })
        .eq('funeral_id', funeralId);

      await syncApprovalAndPaymentToSupabase({ ...booking, funeralId });
    }
  } catch (err) {
    console.warn('Error updating booking details in Supabase:', err);
  }
}

// แปลงลำดับใบงาน (1..8) ไปยังขั้นตอนไทม์ไลน์ (step_no 2..7)
const mapTaskSeqToTimelineStep = (seq) => {
  if (seq === 1 || seq === 5) return 2;
  if (seq === 2 || seq === 3) return 3;
  if (seq === 4) return 4;
  if (seq === 7) return 5;
  if (seq === 6) return 6;
  if (seq === 8) return 7;
  return null;
};

// ============================================================================
// 5. ซิงก์การมอบหมายงาน การกดรับงาน การติ๊กเช็กลิสต์ และการอัปโหลดรูปของแผนก
// ============================================================================
export async function syncTaskUpdateToSupabase(task, options = {}) {
  if (!isSupabaseConfigured || !supabase || !task) return;
  const { syncChecklists = true, syncPhotos = true } = options;
  try {
    const normalizedDept = normalizeDepartmentName(task.department);
    if (task.bookingId) {
      await updateFallbackBookingIfExists(task.bookingId, prev => ({
        ...prev,
        tasks: (prev.tasks || []).map(t => (t.id === task.id ? { ...t, ...task, department: normalizedDept } : t))
      }));
    }

    const workerIdInt = Number(String(task.staffId || '').replace(/\D/g, '')) || null;
    await supabase
      .from('work_tasks')
      .update({
        department_name: normalizedDept,
        primary_worker_id: workerIdInt,
        status: task.status,
        current_step: Number(task.currentStep) || 1,
        notes: task.note || '',
        review_feedback: task.fieldNote || '',
        acknowledged_at: task.acceptedAt ? new Date().toISOString() : null
      })
      .eq('task_id', task.id);

    // อัปเดตสถานะในตาราง funeral_timelines ให้สอดคล้องกับความคืบหน้าของแผนก
    const timelineStep = mapTaskSeqToTimelineStep(Number(task.seq));
    if (timelineStep) {
      const funeralId = task.funeralId || await resolveFuneralId(task.bookingId);
      if (funeralId) {
        const tlStatus = task.status === 'เสร็จสิ้น'
          ? 'เสร็จสิ้น'
          : task.status === 'กำลังดำเนินงาน'
            ? 'กำลังดำเนินงาน'
            : 'รอดำเนินงาน';
        await supabase
          .from('funeral_timelines')
          .update({ status: tlStatus })
          .eq('funeral_id', funeralId)
          .eq('step_no', timelineStep);
      }
    }

    // ซิงก์รายการเช็กลิสต์ย่อย (เฉพาะเมื่อมีการเปลี่ยนเช็กลิสต์)
    if (syncChecklists && Array.isArray(task.checklist) && task.checklist.length > 0) {
      await supabase.from('task_checklists').delete().eq('task_id', task.id);
      await supabase.from('task_checklists').insert(
        task.checklist.map(c => ({
          task_id: t_id_safe(task.id),
          label: c.label,
          is_checked: Boolean(c.isChecked),
          completed_time: c.completedTime || null
        }))
      );
    }

    // ซิงก์รูปภาพหน้างาน (เฉพาะเมื่อมีการเปลี่ยนรูปหรือส่งมอบงาน)
    if (syncPhotos && Array.isArray(task.photos)) {
      await supabase.from('task_progress_reports').delete().eq('task_id', task.id);
      if (task.photos.length > 0) {
        await supabase.from('task_progress_reports').insert(
          task.photos.map(photoUrl => ({
            task_id: task.id,
            photo_url: photoUrl,
            description: task.fieldNote || `รายงานความคืบหน้า ${task.title}`,
            submitted_by: task.staffName || normalizedDept
          }))
        );
      }
    }
  } catch (err) {
    console.warn('Error syncing task update to Supabase:', err);
  }
}

const t_id_safe = (id) => String(id || '');

export async function syncDepartmentTaskToSupabase(task) {
  return syncTaskUpdateToSupabase(task, { syncChecklists: true, syncPhotos: true });
}

// ============================================================================
// 6. ซิงก์การจัดการข้อมูลตั้งต้นฝั่งแอดมิน (Admin Master Data CRUD)
// ============================================================================

// 6.1 แพ็กเกจ (PACKAGES)
export async function syncSavePackageToSupabase(pkg) {
  if (!isSupabaseConfigured || !supabase || !pkg) return { ok: false, reason: 'not_configured' };
  try {
    const extraMetaJson = JSON.stringify({
      categories10: pkg.categories10 || [],
      highlights: pkg.highlights || [],
      durationText: pkg.durationText || ''
    });

    const basePayload = {
      package_id: pkg.id,
      package_name: pkg.name,
      overview_description: pkg.tagline || '',
      target_group: pkg.targetGroup || 'ครอบครัวขนาดกลาง',
      base_price: Number(pkg.price) || 0,
      duration_days: Number(pkg.durationDays) || 3,
      duration_nights: Number(pkg.durationNights) || 2,
      base_guests: Number(pkg.baseGuests) || 50,
      max_guests: Number(pkg.maxGuests) || (Number(pkg.baseGuests) || 50) + 50,
      default_ritual_id: ritualIdToInt(pkg.defaultRitualId),
      is_recommended: Boolean(pkg.isRecommended),
      cover_image_url: pkg.coverImage || '',
      brochure_pdf_url: extraMetaJson,
      status: 'เปิดใช้งาน'
    };

    let { error } = await supabase
      .from('packages')
      .upsert(basePayload, { onConflict: 'package_id' });

    if (error) {
      const fallback1 = { ...basePayload, default_ritual_id: null };
      const retry1 = await supabase.from('packages').upsert(fallback1, { onConflict: 'package_id' });
      error = retry1.error;
    }

    if (error) {
      console.error('❌ บันทึกแพ็กเกจลง Supabase ไม่สำเร็จ:', error.message, error);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    console.warn('Error saving package to Supabase:', err);
    return { ok: false, error: err };
  }
}

export async function syncDeletePackageFromSupabase(pkgId) {
  if (!isSupabaseConfigured || !supabase || !pkgId) return { ok: true };
  try {
    // ตรวจสอบว่ามีใบจองอ้างอิงแพ็กเกจนี้อยู่หรือไม่
    const { data: usedInFunerals, error: checkErr } = await supabase
      .from('funerals')
      .select('funeral_id')
      .eq('package_id', pkgId)
      .limit(1);

    if (!checkErr && usedInFunerals && usedInFunerals.length > 0) {
      return {
        ok: false,
        inUse: true,
        message: 'ไม่สามารถลบแพ็กเกจนี้ได้ เนื่องจากมีใบจองอ้างอิงใช้งานอยู่ในระบบ'
      };
    }

    const { error } = await supabase.from('packages').delete().eq('package_id', pkgId);
    if (error) {
      console.error('❌ ลบแพ็กเกจใน Supabase ไม่สำเร็จ:', error.message, error);
      if (error.code === '23503') {
        return {
          ok: false,
          inUse: true,
          error,
          message: 'ไม่สามารถลบแพ็กเกจนี้ได้ เนื่องจากมีใบจองอ้างอิงใช้งานอยู่ในระบบ'
        };
      }
      if (error.code === '21000') {
        return {
          ok: false,
          error,
          message: 'ลบแพ็กเกจในฐานข้อมูลไม่สำเร็จ (ติด Trigger Error 21000) กรุณารันไฟล์ supabase/4_enable_hard_delete.sql ใน Supabase SQL Editor ก่อนครับ'
        };
      }
      return { ok: false, error, message: `ไม่สามารถลบแพ็กเกจได้: ${error.message}` };
    }

    // ยืนยันว่าแถวถูกลบหายไปจากตารางจริง (ไม่ถูก RLS บล็อกแบบเงียบ)
    const { data: stillExists } = await supabase
      .from('packages')
      .select('package_id')
      .eq('package_id', pkgId)
      .maybeSingle();

    if (stillExists) {
      return {
        ok: false,
        message: 'ไม่สามารถลบแพ็กเกจออกจากฐานข้อมูลได้ (อาจติดสิทธิ์ RLS Policy) กรุณารันไฟล์ supabase/4_enable_hard_delete.sql ใน Supabase SQL Editor'
      };
    }

    return { ok: true };
  } catch (err) {
    console.warn('Error deleting package from Supabase:', err);
    return { ok: false, error: err, message: 'เกิดข้อผิดพลาดระหว่างลบแพ็กเกจจากฐานข้อมูล' };
  }
}

// ซิงก์สถานะแพ็กเกจแนะนำ (is_recommended) ตามแพ็กเกจที่มียอดจองสูงสุดในระบบ
export async function syncRecommendedPackageByBookingsToSupabase(recommendedPkgId, allPackages = []) {
  if (!isSupabaseConfigured || !supabase || !recommendedPkgId) return;
  try {
    await Promise.all(
      allPackages.map(pkg =>
        supabase
          .from('packages')
          .update({ is_recommended: pkg.id === recommendedPkgId })
          .eq('package_id', pkg.id)
      )
    );
  } catch (err) {
    console.warn('Error syncing recommended package to Supabase:', err);
  }
}

// 6.2 บริการเสริม Add-ons (ITEMS)
export async function syncSaveServiceAddonToSupabase(srv) {
  if (!isSupabaseConfigured || !supabase || !srv) return;
  try {
    const metaJson = JSON.stringify({
      category: srv.category || 'หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก',
      department: srv.department || 'ฝ่ายสถานที่',
      isActive: srv.isActive !== false,
      remark: srv.remark || ''
    });
    await supabase.from('items').upsert({
      item_id: srv.id,
      category_id: mapCategoryNameToId(srv.category),
      item_code: srv.id,
      item_name: srv.name,
      description: metaJson,
      unit: srv.unit || 'ชุด',
      base_price: Number(srv.price) || 0,
      is_addon_available: true,
      addon_remark: srv.remark || ''
    }, { onConflict: 'item_id' });
  } catch (err) {
    console.warn('Error saving service addon to Supabase:', err);
  }
}

export async function syncDeleteServiceAddonFromSupabase(srvId) {
  if (!isSupabaseConfigured || !supabase || !srvId) return { ok: true };
  try {
    // ตรวจสอบว่ามีใบจองสั่งใช้งานบริการเสริมนี้อยู่หรือไม่
    const { data: usedInAddons, error: checkErr } = await supabase
      .from('funeral_addons')
      .select('id')
      .eq('item_id', srvId)
      .limit(1);

    if (!checkErr && usedInAddons && usedInAddons.length > 0) {
      return {
        ok: false,
        inUse: true,
        message: 'ไม่สามารถลบบริการเสริมนี้ได้ เนื่องจากมีใบจองสั่งใช้งานอยู่ในระบบ'
      };
    }

    const { error } = await supabase.from('items').delete().eq('item_id', srvId);
    if (error) {
      console.error('❌ ลบบริการเสริมใน Supabase ไม่สำเร็จ:', error.message, error);
      if (error.code === '23503') {
        return {
          ok: false,
          inUse: true,
          error,
          message: 'ไม่สามารถลบบริการเสริมนี้ได้ เนื่องจากมีใบจองสั่งใช้งานอยู่ในระบบ'
        };
      }
      return { ok: false, error, message: `ไม่สามารถลบบริการเสริมได้: ${error.message}` };
    }

    const { data: stillExists } = await supabase
      .from('items')
      .select('item_id')
      .eq('item_id', srvId)
      .maybeSingle();

    if (stillExists) {
      return {
        ok: false,
        message: 'ไม่สามารถลบบริการเสริมออกจากฐานข้อมูลได้ (อาจติดสิทธิ์ RLS Policy) กรุณารันไฟล์ supabase/4_enable_hard_delete.sql ใน Supabase SQL Editor'
      };
    }

    return { ok: true };
  } catch (err) {
    console.warn('Error deleting service addon from Supabase:', err);
    return { ok: false, error: err, message: 'เกิดข้อผิดพลาดระหว่างลบบริการเสริมจากฐานข้อมูล' };
  }
}

// 6.3 สถานที่ วัด และศาลา (TEMPLES, TEMPLE_IMAGES, PAVILIONS)
export async function syncSaveLocationToSupabase(loc) {
  if (!isSupabaseConfigured || !supabase || !loc) return { ok: true, blockedPavilions: [] };
  try {
    const templeId = loc.templeId || Number(String(loc.id || '').replace(/\D/g, '')) || undefined;
    const payload = {
      temple_name: loc.name,
      temple_type: loc.type || 'วัด',
      phone: loc.phone || '',
      address_detail: loc.address || '',
      subdistrict: loc.subdistrict || 'หนองหาร',
      district: loc.district || 'สันทราย',
      province: loc.province || 'เชียงใหม่',
      postal_code: loc.postalCode || '50290',
      map_url: loc.mapUrl || '',
      additional_details: loc.details || '',
      status: loc.isActive === false ? 'ปิดใช้งาน' : 'เปิดให้บริการ'
    };
    if (templeId) payload.temple_id = templeId;

    const { data: savedTemple } = await supabase
      .from('temples')
      .upsert(payload, { onConflict: 'temple_id' })
      .select('temple_id')
      .single();

    const blockedPavilions = [];
    const savedPavilions = [];
    const targetTempleId = savedTemple?.temple_id || templeId;
    if (targetTempleId) {
      if (Array.isArray(loc.images)) {
        await supabase.from('temple_images').delete().eq('temple_id', targetTempleId);
<<<<<<< HEAD
        await supabase.from('temple_images').insert(
          loc.images.map((url, i) => ({
            temple_id: targetTempleId,
            image_url: url
            // sort_order: i + 1
          }))
        );
=======
        if (loc.images.length > 0) {
          await supabase.from('temple_images').insert(
            loc.images.map((url, i) => ({
              temple_id: targetTempleId,
              image_url: url,
              sort_order: i + 1
            }))
          );
        }
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
      }
      if (Array.isArray(loc.pavilions) && loc.pavilions.length > 0) {
        const { data: existingPavs } = await supabase
          .from('pavilions')
          .select('pavilion_id, pavilion_name, capacity, status')
          .eq('temple_id', targetTempleId);

        const keptIds = [];
        for (const p of loc.pavilions) {
          const existingId = p.pavilionId || (Number(String(p.id || '').replace(/\D/g, '')) < 10000 ? Number(String(p.id || '').replace(/\D/g, '')) : null);
          if (existingId && (existingPavs || []).some(ep => ep.pavilion_id === existingId)) {
            keptIds.push(existingId);
            await supabase
              .from('pavilions')
              .update({
                pavilion_name: p.name,
                capacity: Number(p.capacity) || 150,
                status: p.isActive === false ? 'ปิดปรับปรุง' : 'ว่างพร้อมบริการ'
              })
              .eq('pavilion_id', existingId);
            savedPavilions.push({
              ...p,
              id: `PAV-${String(existingId).padStart(2, '0')}`,
              pavilionId: existingId
            });
          } else {
            const { data: newPav } = await supabase
              .from('pavilions')
              .insert({
                temple_id: targetTempleId,
                pavilion_name: p.name,
                capacity: Number(p.capacity) || 150,
                status: p.isActive === false ? 'ปิดปรับปรุง' : 'ว่างพร้อมบริการ'
              })
              .select('pavilion_id')
              .maybeSingle();
            if (newPav?.pavilion_id) {
              keptIds.push(newPav.pavilion_id);
              savedPavilions.push({
                ...p,
                id: `PAV-${String(newPav.pavilion_id).padStart(2, '0')}`,
                pavilionId: newPav.pavilion_id
              });
            }
          }
        }

        for (const ep of existingPavs || []) {
          if (!keptIds.includes(ep.pavilion_id)) {
            const { data: usedInFunerals, error: checkErr } = await supabase
              .from('funerals')
              .select('funeral_id')
              .eq('pavilion_id', ep.pavilion_id)
              .limit(1);

            if (!checkErr && usedInFunerals && usedInFunerals.length > 0) {
              blockedPavilions.push({
                id: `PAV-${String(ep.pavilion_id).padStart(2, '0')}`,
                pavilionId: ep.pavilion_id,
                name: ep.pavilion_name,
                capacity: ep.capacity || 150,
                isActive: ep.status !== 'ปิดปรับปรุง'
              });
              continue;
            }

            const { error: delPavErr } = await supabase
              .from('pavilions')
              .delete()
              .eq('pavilion_id', ep.pavilion_id);

            if (delPavErr) {
              console.error('❌ ลบศาลาใน Supabase ไม่สำเร็จ:', delPavErr.message, delPavErr);
              blockedPavilions.push({
                id: `PAV-${String(ep.pavilion_id).padStart(2, '0')}`,
                pavilionId: ep.pavilion_id,
                name: ep.pavilion_name,
                capacity: ep.capacity || 150,
                isActive: ep.status !== 'ปิดปรับปรุง'
              });
            }
          }
        }
      }
    }

    if (blockedPavilions.length > 0) {
      const names = blockedPavilions.map(p => p.name).join(', ');
      return {
        ok: false,
        inUse: true,
        templeId: targetTempleId,
        savedPavilions,
        blockedPavilions,
        message: `ไม่สามารถลบศาลา (${names}) ได้ เนื่องจากมีใบจองอ้างอิงใช้งานอยู่ในระบบ`
      };
    }

    return { ok: true, templeId: targetTempleId, savedPavilions, blockedPavilions: [] };
  } catch (err) {
    console.warn('Error saving location to Supabase:', err);
    return { ok: false, error: err, blockedPavilions: [] };
  }
}

export async function syncDeleteLocationFromSupabase(locId) {
  if (!isSupabaseConfigured || !supabase || !locId) return { ok: true };
  try {
    const templeId = Number(String(locId).replace(/\D/g, ''));
    if (!templeId) return { ok: true };

    // ตรวจสอบว่ามีใบจองอ้างอิงสถานที่หรือศาลาในสถานที่นี้อยู่หรือไม่
    const { data: usedTemple, error: checkTempleErr } = await supabase
      .from('funerals')
      .select('funeral_id')
      .eq('temple_id', templeId)
      .limit(1);

    if (!checkTempleErr && usedTemple && usedTemple.length > 0) {
      return {
        ok: false,
        inUse: true,
        message: 'ไม่สามารถลบสถานที่นี้ได้ เนื่องจากมีใบจองอ้างอิงใช้งานอยู่ในระบบ'
      };
    }

    const { data: templePavs } = await supabase
      .from('pavilions')
      .select('pavilion_id')
      .eq('temple_id', templeId);

    const pavIds = (templePavs || []).map(p => p.pavilion_id);
    if (pavIds.length > 0) {
      const { data: usedPav, error: checkPavErr } = await supabase
        .from('funerals')
        .select('funeral_id')
        .in('pavilion_id', pavIds)
        .limit(1);

      if (!checkPavErr && usedPav && usedPav.length > 0) {
        return {
          ok: false,
          inUse: true,
          message: 'ไม่สามารถลบสถานที่นี้ได้ เนื่องจากมีใบจองใช้งานศาลาในสถานที่นี้อยู่'
        };
      }
    }

    const { error } = await supabase.from('temples').delete().eq('temple_id', templeId);
    if (error) {
      console.error('❌ ลบสถานที่ใน Supabase ไม่สำเร็จ:', error.message, error);
      if (error.code === '23503') {
        return {
          ok: false,
          inUse: true,
          error,
          message: 'ไม่สามารถลบสถานที่นี้ได้ เนื่องจากมีใบจองอ้างอิงใช้งานอยู่ในระบบ'
        };
      }
      return { ok: false, error, message: `ไม่สามารถลบสถานที่ได้: ${error.message}` };
    }

    const { data: stillExists } = await supabase
      .from('temples')
      .select('temple_id')
      .eq('temple_id', templeId)
      .maybeSingle();

    if (stillExists) {
      return {
        ok: false,
        message: 'ไม่สามารถลบสถานที่ออกจากฐานข้อมูลได้ (อาจติดสิทธิ์ RLS Policy) กรุณารันไฟล์ supabase/4_enable_hard_delete.sql ใน Supabase SQL Editor'
      };
    }

    return { ok: true };
  } catch (err) {
    console.warn('Error deleting location from Supabase:', err);
    return { ok: false, error: err, message: 'เกิดข้อผิดพลาดระหว่างลบสถานที่จากฐานข้อมูล' };
  }
}

// 6.4 แผนกและบุคลากร (DEPARTMENTS & COMMUNITY_WORKERS)
export async function syncAddDepartmentToSupabase(deptName) {
  if (!isSupabaseConfigured || !supabase || !deptName) return;
  try {
    const cleanName = stripDepartmentPrefix(deptName);
    await supabase.from('departments').upsert({
      department_name: cleanName,
      description: `แผนก${cleanName}`,
      is_active: true
    }, { onConflict: 'department_name' });
  } catch (err) {
    console.warn('Error adding department to Supabase:', err);
  }
}

export async function syncRemoveDepartmentFromSupabase(deptName) {
  if (!isSupabaseConfigured || !supabase || !deptName) return { ok: true };
  try {
    const normalized = normalizeDepartmentName(deptName);
    const cleanName = stripDepartmentPrefix(deptName);
    const { data: matchedDepts } = await supabase
      .from('departments')
      .select('department_id, department_name')
      .or(`department_name.eq.${cleanName},department_name.eq.${normalized}`);

    const deptIds = (matchedDepts || []).map(d => d.department_id);

    // ตรวจสอบว่ามีบุคลากรสังกัดแผนกนี้อยู่หรือไม่
    const { data: assignedWorkers } = await supabase
      .from('community_workers')
      .select('worker_id')
      .or(`department_name.eq.${cleanName},department_name.eq.${normalized}`)
      .limit(1);

    if (assignedWorkers && assignedWorkers.length > 0) {
      return {
        ok: false,
        inUse: true,
        message: 'ไม่สามารถลบแผนกนี้ได้ เนื่องจากยังมีบุคลากรสังกัดแผนกนี้อยู่ กรุณาย้ายหรือลบบุคลากรก่อน'
      };
    }

    // ตรวจสอบว่ามีใบงานจากใบจองอ้างอิงแผนกนี้อยู่หรือไม่
    const { data: usedTasksByName } = await supabase
      .from('work_tasks')
      .select('task_id')
      .or(`department_name.eq.${cleanName},department_name.eq.${normalized}`)
      .limit(1);

    if (usedTasksByName && usedTasksByName.length > 0) {
      return {
        ok: false,
        inUse: true,
        message: 'ไม่สามารถลบแผนกนี้ได้ เนื่องจากมีใบงานจากใบจองอ้างอิงแผนกนี้อยู่'
      };
    }

    if (deptIds.length > 0) {
      const { data: usedTasksById } = await supabase
        .from('work_tasks')
        .select('task_id')
        .in('department_id', deptIds)
        .limit(1);

      if (usedTasksById && usedTasksById.length > 0) {
        return {
          ok: false,
          inUse: true,
          message: 'ไม่สามารถลบแผนกนี้ได้ เนื่องจากมีใบงานจากใบจองอ้างอิงแผนกนี้อยู่'
        };
      }
    }

    const { error } = await supabase
      .from('departments')
      .delete()
      .or(`department_name.eq.${cleanName},department_name.eq.${normalized}`);

    if (error) {
      console.error('❌ ลบแผนกใน Supabase ไม่สำเร็จ:', error.message, error);
      if (error.code === '23503') {
        return {
          ok: false,
          inUse: true,
          error,
          message: 'ไม่สามารถลบแผนกนี้ได้ เนื่องจากมีใบงานหรือข้อมูลอื่นอ้างอิงอยู่'
        };
      }
      return { ok: false, error, message: `ไม่สามารถลบแผนกได้: ${error.message}` };
    }

    const { data: stillExists } = await supabase
      .from('departments')
      .select('department_id')
      .or(`department_name.eq.${cleanName},department_name.eq.${normalized}`)
      .limit(1);

    if (stillExists && stillExists.length > 0) {
      return {
        ok: false,
        message: 'ไม่สามารถลบแผนกออกจากฐานข้อมูลได้ (อาจติดสิทธิ์ RLS Policy) กรุณารันไฟล์ supabase/4_enable_hard_delete.sql ใน Supabase SQL Editor'
      };
    }

    return { ok: true };
  } catch (err) {
    console.warn('Error removing department from Supabase:', err);
    return { ok: false, error: err, message: 'เกิดข้อผิดพลาดระหว่างลบแผนกจากฐานข้อมูล' };
  }
}

export async function syncSaveStaffMemberToSupabase(staffMember) {
  if (!isSupabaseConfigured || !supabase || !staffMember) return;
  try {
    const workerId = staffMember.workerId || Number(String(staffMember.id || '').replace(/\D/g, '')) || undefined;
    const nameParts = (staffMember.fullName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || staffMember.fullName || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const cleanDept = stripDepartmentPrefix(staffMember.department || 'ฝ่ายสถานที่');
    const normalizedDept = normalizeDepartmentName(staffMember.department || 'ฝ่ายสถานที่');

    // ค้นหา department_id จริงในตาราง departments
    const { data: deptRow } = await supabase
      .from('departments')
      .select('department_id')
      .or(`department_name.eq.${cleanDept},department_name.eq.${normalizedDept}`)
      .maybeSingle();

    const payload = {
      prefix: staffMember.prefix || 'นาง',
      first_name: firstName,
      last_name: lastName,
      full_name: staffMember.fullName,
      department_id: deptRow?.department_id ?? staffMember.departmentId ?? null,
      department_name: cleanDept,
      role_title: staffMember.roleTitle || `เจ้าหน้าที่${normalizedDept}`,
      phone: staffMember.phone || '',
      email: staffMember.email || '',
      address_detail: staffMember.address || '',
      subdistrict: staffMember.subdistrict || 'หนองหาร',
      district: staffMember.district || 'สันทราย',
      province: staffMember.province || 'เชียงใหม่',
      postal_code: staffMember.postalCode || '50290',
      status: staffMember.status || 'พร้อมปฏิบัติงาน'
    };
    if (workerId) payload.worker_id = workerId;

    await supabase.from('community_workers').upsert(payload, { onConflict: 'worker_id' });
  } catch (err) {
    console.warn('Error saving staff member to Supabase:', err);
  }
}

export async function syncDeleteStaffMemberFromSupabase(staffId) {
  if (!isSupabaseConfigured || !supabase || !staffId) return { ok: true };
  try {
    const workerId = Number(String(staffId).replace(/\D/g, ''));
    if (!workerId) return { ok: true };

    // ตรวจสอบว่ามีใบงานจากใบจองมอบหมายให้บุคลากรนี้อยู่หรือไม่
    const [{ data: usedPrimary }, { data: usedAssistant }] = await Promise.all([
      supabase.from('work_tasks').select('task_id').eq('primary_worker_id', workerId).limit(1),
      supabase.from('task_assistants').select('id').eq('worker_id', workerId).limit(1)
    ]);

    if ((usedPrimary && usedPrimary.length > 0) || (usedAssistant && usedAssistant.length > 0)) {
      return {
        ok: false,
        inUse: true,
        message: 'ไม่สามารถลบบุคลากรนี้ได้ เนื่องจากมีใบงานจากใบจองมอบหมายให้บุคลากรนี้อยู่'
      };
    }

    const { error } = await supabase.from('community_workers').delete().eq('worker_id', workerId);
    if (error) {
      console.error('❌ ลบบุคลากรใน Supabase ไม่สำเร็จ:', error.message, error);
      if (error.code === '23503') {
        return {
          ok: false,
          inUse: true,
          error,
          message: 'ไม่สามารถลบบุคลากรนี้ได้ เนื่องจากมีใบงานจากใบจองอ้างอิงอยู่'
        };
      }
      return { ok: false, error, message: `ไม่สามารถลบบุคลากรได้: ${error.message}` };
    }

    const { data: stillExists } = await supabase
      .from('community_workers')
      .select('worker_id')
      .eq('worker_id', workerId)
      .maybeSingle();

    if (stillExists) {
      return {
        ok: false,
        message: 'ไม่สามารถลบบุคลากรออกจากฐานข้อมูลได้ (อาจติดสิทธิ์ RLS Policy) กรุณารันไฟล์ supabase/4_enable_hard_delete.sql ใน Supabase SQL Editor'
      };
    }

    return { ok: true };
  } catch (err) {
    console.warn('Error deleting staff member from Supabase:', err);
    return { ok: false, error: err, message: 'เกิดข้อผิดพลาดระหว่างลบบุคลากรจากฐานข้อมูล' };
  }
}
