import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  INITIAL_PACKAGES,
  INITIAL_SERVICES,
  INITIAL_LOCATIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_STAFF,
  buildFullScheduleItems
} from '../data/initialData';

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

// ============================================================================
// 1. ดึงข้อมูลทั้งหมดจาก Supabase ตอนเปิดเว็บ (Full Read / Hydration)
// ============================================================================
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

    // 1.1 แปลงข้อมูลแผนก (DEPARTMENTS)
    const departments = dbDepts && dbDepts.length > 0
      ? dbDepts.map(d => d.department_name.startsWith('ฝ่าย') ? d.department_name : `ฝ่าย${d.department_name}`)
      : INITIAL_DEPARTMENTS;

    // 1.2 แปลงข้อมูลบุคลากร (COMMUNITY_WORKERS)
    const staff = dbWorkers && dbWorkers.length > 0
      ? dbWorkers.map((w, idx) => {
          const deptLabel = w.department_name
            ? (w.department_name.startsWith('ฝ่าย') ? w.department_name : `ฝ่าย${w.department_name}`)
            : departments[0];
          return {
            id: `STF-${String(w.worker_id || idx + 1).padStart(2, '0')}`,
            workerId: w.worker_id,
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
    const locations = dbTemples && dbTemples.length > 0
      ? dbTemples.map((t, idx) => {
          const locId = `LOC-${String(t.temple_id || idx + 1).padStart(2, '0')}`;
          const imgs = (dbTempleImages || [])
            .filter(img => img.temple_id === t.temple_id)
            .map(img => img.image_url);
          const pavs = (dbPavilions || [])
            .filter(p => p.temple_id === t.temple_id)
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
    const packages = dbPackages && dbPackages.length > 0
      ? dbPackages.map(p => {
          const templatePkg = INITIAL_PACKAGES.find(ip => ip.id === p.package_id) || INITIAL_PACKAGES[0];
          return {
            ...templatePkg,
            id: p.package_id,
            name: p.package_name,
            tagline: p.overview_description || templatePkg.tagline,
            targetGroup: p.target_group || templatePkg.targetGroup,
            price: Number(p.base_price) || templatePkg.price,
            durationDays: Number(p.duration_days) || templatePkg.durationDays,
            durationNights: Number(p.duration_nights) || templatePkg.durationNights,
            durationText: p.duration || `${p.duration_days} วัน ${p.duration_nights} คืน`,
            baseGuests: Number(p.base_guests) || templatePkg.baseGuests,
            maxGuests: Number(p.max_guests) || templatePkg.maxGuests,
            defaultRitualId: intToRitualId(p.default_ritual_id),
            isRecommended: Boolean(p.is_recommended),
            coverImage: p.cover_image_url || templatePkg.coverImage,
            dailySchedule: templatePkg.dailySchedule || buildFullScheduleItems(p.package_id)
          };
        })
      : INITIAL_PACKAGES;

    // 1.5 แปลงข้อมูลบริการเสริม Add-ons (ITEMS where is_addon_available = true)
    const addonItems = (dbItems || []).filter(i => i.is_addon_available);
    const services = addonItems.length > 0
      ? addonItems.map((item, idx) => {
          const existingSrv = INITIAL_SERVICES.find(s => s.name === item.item_name || s.id === item.item_id) || INITIAL_SERVICES[idx % INITIAL_SERVICES.length];
          return {
            ...(existingSrv || {}),
            id: item.item_id,
            name: item.item_name,
            unit: item.unit || 'ชุด',
            price: Number(item.base_price) || 0,
            remark: item.addon_remark || item.description || '',
            category: existingSrv?.category || 'หมวดอุปกรณ์และบริการเสริม',
            department: existingSrv?.department || 'ฝ่ายสถานที่',
            isActive: true
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
        const pkg = packages.find(p => p.id === f.package_id) || packages[0];
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
          durationNights: (Number(f.duration_days) || 3) - 1,
          baseGuests: Number(f.base_guests) || pkg.baseGuests,
          extraGuests: Number(f.extra_guests) || 0,
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
          appointmentDate: f.start_date,
          appointmentTime: '09:00 - 10:00 น.',
          paymentOption: pay2 ? 'INSTALLMENT' : 'FULL',
          installment1Percent: pay1 ? Number(pay1.percentage) : 25,
          installment1Amount: pay1 ? Number(pay1.paid_amount) : Number(f.total_amount) * 0.25,
          installment1Paid: pay1 ? pay1.payment_status === 'ชำระเงินแล้ว' : false,
          installment1PaidAt: pay1?.paid_at ? new Date(pay1.paid_at).toLocaleDateString('th-TH') : null,
          installment1Slip: pay1?.payment_proof_url || null,
          installment2Amount: pay2 ? Number(pay2.paid_amount) : Number(f.total_amount) * 0.75,
          installment2Paid: pay2 ? pay2.payment_status === 'ชำระเงินแล้ว' : false,
          installment2PaidAt: pay2?.paid_at ? new Date(pay2.paid_at).toLocaleDateString('th-TH') : null,
          installment2Slip: pay2?.payment_proof_url || null,
          addons: fAddons,
          addonsTotal: Number(f.addons_amount) || 0,
          netTotal: Number(f.total_amount) || 0,
          status: f.status || 'รออนุมัติ',
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
        const worker = staff.find(s => s.workerId === t.primary_worker_id) || staff.find(s => s.department.includes(t.department_name || '')) || staff[0];
        const checklists = (dbChecklists || [])
          .filter(c => c.task_id === t.task_id)
          .map((c, idx) => ({
            id: `chk-${c.checklist_id || idx + 1}`,
            checklistId: c.checklist_id,
            label: c.label,
            isChecked: Boolean(c.is_checked),
            completedTime: c.completed_time || ''
          }));
        const reports = (dbReports || []).filter(r => r.task_id === t.task_id);
        const photos = reports.map(r => r.photo_url).filter(Boolean);
        const latestReport = reports[reports.length - 1];

        return {
          id: t.task_id,
          bookingId,
          funeralId: t.funeral_id,
          seq: t.task_seq || 1,
          title: t.title,
          department: t.department_name || worker?.department || 'ฝ่ายสถานที่',
          staffId: worker?.id || 'STF-01',
          staffName: worker?.fullName || 'เจ้าหน้าที่ชุมชน',
          staffPhone: worker?.phone || '081-111-1111',
          workDate: t.work_date || parentFuneral?.start_date || '',
          workTime: t.work_time || '09:00 น.',
          locationDisplay: t.location_display || 'วัดวิเวกวนาราม (ศาลา 1)',
          note: t.notes || '',
          status: t.status || 'ยังไม่ได้มอบหมาย',
          currentStep: Number(t.current_step) || 1,
          checklist: checklists,
          photos,
          fieldNote: latestReport?.description || t.review_feedback || '',
          completedAt: t.status === 'เสร็จสิ้น' && latestReport?.submitted_at
            ? new Date(latestReport.submitted_at).toLocaleDateString('th-TH')
            : null
        };
      });
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
export async function seedInitialBookingsToSupabaseIfEmpty(initialBookings, buildInitialAssignmentsFn) {
  if (!isSupabaseConfigured || !supabase) return;
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
  }
}

// ============================================================================
// 3. ซิงก์คำขอจัดงานใหม่จากหน้า 4-Step Booking ลงตารางตาม ER Diagram บน Supabase
// ============================================================================
export async function syncNewBookingToSupabase(booking, tasks) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    // 1. บันทึกข้อมูลผู้ติดต่อ (CONTACT_PERSONS)
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

    // 2. บันทึกข้อมูลผู้เสียชีวิต (DECEASED_PERSONS)
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

    // แปลงรหัสวัดและศาลาเป็นตัวเลข FK
    const templeIdInt = Number(String(booking.locationId || 'LOC-01').replace(/\D/g, '')) || 1;
    const pavilionIdInt = Number(String(booking.pavilionId || 'PAV-01').replace(/\D/g, '')) || 1;
    const selectedRitualInt = ritualIdToInt(booking.ritualId);

    // 3. บันทึกใบจองงานศพหลัก (FUNERALS)
    const { data: funeralRow, error: funeralErr } = await supabase
      .from('funerals')
      .upsert({
        funeral_code: booking.code,
        req_number: booking.reqNumber || booking.id,
        contact_id: contactRow?.contact_id || null,
        contact_relationship: booking.contact?.relationship || '',
        deceased_id: deceasedRow?.deceased_id || null,
        package_id: booking.packageId || 'PKG-01',
        selected_ritual_id: selectedRitualInt,
        temple_id: templeIdInt,
        pavilion_id: pavilionIdInt,
        start_date: booking.startDate,
        cremation_date: booking.cremationDate || booking.endDate || booking.startDate,
        bone_collection_date: booking.boneCollectionDate || null,
        end_date: booking.endDate || booking.cremationDate || booking.startDate,
        duration_days: Number(booking.durationDays) || 3,
        base_guests: Number(booking.baseGuests) || 50,
        extra_guests: Number(booking.extraGuests) || 0,
        expected_guests: Number(booking.totalGuests) || 50,
        package_amount: Number(booking.packagePrice) || 0,
        ritual_upgrade_amount: Number(booking.ritualUpgradePrice) || 0,
        addons_amount: Number(booking.addonsTotal) || 0,
        total_amount: Number(booking.netTotal || booking.totalAmount) || 0,
        status: booking.status || 'รออนุมัติ',
        special_instructions: booking.specialNote || ''
      }, { onConflict: 'req_number' })
      .select('funeral_id')
      .single();

    if (funeralErr) {
      console.warn('Supabase funerals insert warning:', funeralErr.message);
      return;
    }

    const funeralId = funeralRow.funeral_id;

    // 4. บันทึกรายการบริการเสริมที่สั่งเพิ่ม (FUNERAL_ADDONS)
    if (Array.isArray(booking.addons) && booking.addons.length > 0) {
      for (const addon of booking.addons) {
        // ตรวจสอบว่ามี item_id ในตาราง items หรือยัง ถ้ายังให้สร้างอัตโนมัติเพื่อไม่ให้ติด FK
        await supabase.from('items').upsert({
          item_id: addon.id,
          category_id: 9,
          item_name: addon.name,
          unit: addon.unit || 'ชุด',
          base_price: Number(addon.price) || 0,
          is_addon_available: true
        }, { onConflict: 'item_id' });

        await supabase.from('funeral_addons').insert({
          funeral_id: funeralId,
          item_id: addon.id,
          qty: Number(addon.qty) || 1,
          unit_price: Number(addon.price) || 0,
          price: Number(addon.total) || (Number(addon.price) * Number(addon.qty)) || 0
        });
      }
    }

    // 5. บันทึกเอกสารแนบ (FUNERAL_DOCUMENTS)
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
      await supabase.from('funeral_documents').insert(docsToInsert);
    }

    // 6. บันทึกงวดการชำระเงิน (PAYMENTS)
    const paymentsToInsert = [
      {
        payment_id: `PAY-${booking.id}-1`,
        funeral_id: funeralId,
        installment_no: 1,
        percentage: Number(booking.installment1Percent) || 100,
        paid_amount: Number(booking.installment1Amount) || Number(booking.netTotal) || 0,
        payment_status: booking.installment1Paid ? 'ชำระเงินแล้ว' : 'รอดำเนินการ',
        payment_proof_url: booking.installment1Slip || null,
        paid_at: booking.installment1Paid ? new Date().toISOString() : null
      }
    ];
    if (booking.paymentOption === 'INSTALLMENT' || booking.paymentPlan === 'installment') {
      paymentsToInsert.push({
        payment_id: `PAY-${booking.id}-2`,
        funeral_id: funeralId,
        installment_no: 2,
        percentage: 100 - (Number(booking.installment1Percent) || 25),
        paid_amount: Number(booking.installment2Amount) || 0,
        payment_status: booking.installment2Paid ? 'ชำระเงินแล้ว' : 'รอดำเนินการ',
        payment_proof_url: booking.installment2Slip || null,
        paid_at: booking.installment2Paid ? new Date().toISOString() : null
      });
    }
    await supabase.from('payments').upsert(paymentsToInsert, { onConflict: 'payment_id' });

    // 7. บันทึกไทม์ไลน์ 8 ขั้นตอน (FUNERAL_TIMELINES)
    const timelineSteps = [
      { step_no: 1, title: 'รับคำขอและตรวจสอบเอกสารสำคัญ', responsible_info: 'ผู้ดูแลระบบกลาง' },
      { step_no: 2, title: 'จัดเตรียมศาลา โต๊ะ เก้าอี้ เต็นท์ และไฟฟ้า', responsible_info: 'ฝ่ายสถานที่' },
      { step_no: 3, title: 'เคลื่อนย้ายร่างและบรรจุหีบศพ/โลงเย็น', responsible_info: 'ฝ่ายยานพาหนะ และฝ่ายหีบศพ' },
      { step_no: 4, title: 'จัดดอกไม้หน้าหีบศพ กรอบรูป และปราสาทศพ', responsible_info: 'ฝ่ายดอกไม้และตกแต่ง' },
      { step_no: 5, title: 'เตรียมขันตั้ง สวยดอก ผ้าบังสุกุล และสังฆทาน', responsible_info: 'ฝ่ายหัตถกรรม และฝ่ายพิธีการ' },
      { step_no: 6, title: 'บริการน้ำดื่ม อาหารว่าง และโรงครัวตลอดงาน', responsible_info: 'ฝ่ายอาหารและเครื่องดื่ม' },
      { step_no: 7, title: 'ประกอบพิธีสวดพระอภิธรรมและพิธีล้านนา', responsible_info: 'ฝ่ายพิธีการและศาสนา' },
      { step_no: 8, title: 'พิธีเคลื่อนขบวน ฌาปนกิจ และเก็บอัฐิ', responsible_info: 'ทุกฝ่ายร่วมส่งมอบงาน' }
    ];
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
        const { error: taskErr } = await supabase.from('work_tasks').upsert({
          task_id: t.id,
          funeral_id: funeralId,
          task_seq: t.seq || 1,
          title: t.title,
          department_name: t.department,
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
              submitted_by: t.staffName || t.department
            }))
          );
        }
      }
    }
  } catch (err) {
    console.warn('Error syncing booking to Supabase:', err);
  }
}

// ============================================================================
// 4. ซิงก์การชำระเงิน การอนุมัติคำขอ และการปิดจบงานบริบูรณ์ (Admin Actions)
// ============================================================================
export async function syncApprovalAndPaymentToSupabase(booking) {
  if (!isSupabaseConfigured || !supabase || !booking) return;
  try {
    const reqNum = booking.reqNumber || booking.id;
    const { data: funeralRow } = await supabase
      .from('funerals')
      .update({
        status: booking.status,
        updated_at: new Date().toISOString()
      })
      .eq('req_number', reqNum)
      .select('funeral_id')
      .maybeSingle();

    const funeralId = funeralRow?.funeral_id || booking.funeralId;

    // อัปเดตงวดที่ 1
    await supabase
      .from('payments')
      .upsert({
        payment_id: `PAY-${booking.id}-1`,
        funeral_id: funeralId,
        installment_no: 1,
        percentage: Number(booking.installment1Percent) || 25,
        paid_amount: Number(booking.installment1Amount) || 0,
        payment_proof_url: booking.installment1Slip || null,
        payment_status: booking.installment1Paid ? 'ชำระเงินแล้ว' : 'รอดำเนินการ',
        paid_at: booking.installment1Paid ? new Date().toISOString() : null
      }, { onConflict: 'payment_id' });

    // อัปเดตงวดที่ 2 (ถ้ามี)
    if (booking.paymentOption === 'INSTALLMENT' || booking.installment2Slip || booking.installment2Paid) {
      await supabase
        .from('payments')
        .upsert({
          payment_id: `PAY-${booking.id}-2`,
          funeral_id: funeralId,
          installment_no: 2,
          percentage: 100 - (Number(booking.installment1Percent) || 25),
          paid_amount: Number(booking.installment2Amount) || 0,
          payment_proof_url: booking.installment2Slip || null,
          payment_status: booking.installment2Paid ? 'ชำระเงินแล้ว' : 'รอดำเนินการ',
          paid_at: booking.installment2Paid ? new Date().toISOString() : null
        }, { onConflict: 'payment_id' });
    }

    // ถ้าอนุมัติแล้ว ให้เปลี่ยนสถานะใบงานแผนกที่ยังไม่ได้มอบหมายเป็น 'มอบหมายแล้ว'
    if (booking.status === 'กำลังดำเนินงาน' && funeralId) {
      await supabase
        .from('work_tasks')
        .update({ status: 'มอบหมายแล้ว' })
        .eq('funeral_id', funeralId)
        .eq('status', 'ยังไม่ได้มอบหมาย');
    }
  } catch (err) {
    console.warn('Error syncing payment/approval to Supabase:', err);
  }
}

export async function syncCompleteEntireBookingToSupabase(bookingId) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data: funeralRow } = await supabase
      .from('funerals')
      .update({
        status: 'เสร็จสิ้น',
        close_summary: 'ส่งมอบงานครบทุกแผนกและรับชำระเงินครบถ้วนบริบูรณ์',
        updated_at: new Date().toISOString()
      })
      .eq('req_number', bookingId)
      .select('funeral_id')
      .maybeSingle();

    if (funeralRow?.funeral_id) {
      await supabase
        .from('funeral_timelines')
        .update({ status: 'เสร็จสิ้น', updated_at: new Date().toISOString() })
        .eq('funeral_id', funeralRow.funeral_id);
    }
  } catch (err) {
    console.warn('Error completing entire booking in Supabase:', err);
  }
}

// ============================================================================
// 5. ซิงก์การมอบหมายงาน การกดรับงาน การติ๊กเช็กลิสต์ และการอัปโหลดรูปของแผนก
// ============================================================================
export async function syncTaskUpdateToSupabase(task) {
  if (!isSupabaseConfigured || !supabase || !task) return;
  try {
    const workerIdInt = Number(String(task.staffId || '').replace(/\D/g, '')) || null;
    await supabase
      .from('work_tasks')
      .update({
        department_name: task.department,
        primary_worker_id: workerIdInt,
        status: task.status,
        current_step: Number(task.currentStep) || 1,
        notes: task.note || '',
        review_feedback: task.fieldNote || '',
        acknowledged_at: task.acceptedAt ? new Date().toISOString() : null
      })
      .eq('task_id', task.id);

    // ซิงก์รายการเช็กลิสต์ย่อย
    if (Array.isArray(task.checklist) && task.checklist.length > 0) {
      await supabase.from('task_checklists').delete().eq('task_id', task.id);
      await supabase.from('task_checklists').insert(
        task.checklist.map(c => ({
          task_id: task.id,
          label: c.label,
          is_checked: Boolean(c.isChecked),
          completed_time: c.completedTime || null,
          updated_at: new Date().toISOString()
        }))
      );
    }

    // ซิงก์รูปภาพหน้างาน
    if (Array.isArray(task.photos)) {
      await supabase.from('task_progress_reports').delete().eq('task_id', task.id);
      if (task.photos.length > 0) {
        await supabase.from('task_progress_reports').insert(
          task.photos.map(photoUrl => ({
            task_id: task.id,
            photo_url: photoUrl,
            description: task.fieldNote || `รายงานความคืบหน้า ${task.title}`,
            submitted_by: task.staffName || task.department
          }))
        );
      }
    }
  } catch (err) {
    console.warn('Error syncing task update to Supabase:', err);
  }
}

export async function syncDepartmentTaskToSupabase(task) {
  return syncTaskUpdateToSupabase(task);
}

// ============================================================================
// 6. ซิงก์การจัดการข้อมูลตั้งต้นฝั่งแอดมิน (Admin Master Data CRUD)
// ============================================================================

// 6.1 แพ็กเกจ (PACKAGES)
export async function syncSavePackageToSupabase(pkg) {
  if (!isSupabaseConfigured || !supabase || !pkg) return { ok: false, reason: 'not_configured' };
  try {
    // ชุดคอลัมน์มาตรฐานตาม 2_insert_master_data.sql
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
      status: 'เปิดใช้งาน'
    };

    let { error } = await supabase
      .from('packages')
      .upsert(basePayload, { onConflict: 'package_id' });

    // Fallback 1: กรณีติด Foreign Key ของ default_ritual_id
    if (error) {
      console.warn('⚠️ Upsert packages รอบที่ 1 ติดปัญหา กำลังลองบันทึกด้วย Payload สำรอง (1):', error.message);
      const fallback1 = { ...basePayload, default_ritual_id: null };
      const retry1 = await supabase.from('packages').upsert(fallback1, { onConflict: 'package_id' });
      error = retry1.error;
    }

    // Fallback 2: กรณีตาราง packages ใน Supabase มีเฉพาะคอลัมน์หลัก
    if (error) {
      console.warn('⚠️ Upsert packages รอบที่ 2 ติดปัญหา กำลังลองบันทึกด้วยคอลัมน์หลัก (2):', error.message);
      const minimalPayload = {
        package_id: pkg.id,
        package_name: pkg.name,
        overview_description: pkg.tagline || '',
        base_price: Number(pkg.price) || 0,
        duration_days: Number(pkg.durationDays) || 3,
        duration_nights: Number(pkg.durationNights) || 2,
        base_guests: Number(pkg.baseGuests) || 50,
        is_recommended: Boolean(pkg.isRecommended)
      };
      const retry2 = await supabase.from('packages').upsert(minimalPayload, { onConflict: 'package_id' });
      error = retry2.error;
    }

    if (error) {
      console.error('❌ บันทึกแพ็กเกจลง Supabase ไม่สำเร็จ:', error.message, error);
      return { ok: false, error };
    }

    console.log(`✅ บันทึกแพ็กเกจ ${pkg.id} (${pkg.name}) ลง Supabase สำเร็จ!`);
    return { ok: true };
  } catch (err) {
    console.warn('Error saving package to Supabase:', err);
    return { ok: false, error: err };
  }
}

export async function syncDeletePackageFromSupabase(pkgId) {
  if (!isSupabaseConfigured || !supabase || !pkgId) return;
  try {
    await supabase.from('packages').delete().eq('package_id', pkgId);
  } catch (err) {
    console.warn('Error deleting package from Supabase:', err);
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
    await supabase.from('items').upsert({
      item_id: srv.id,
      category_id: mapCategoryNameToId(srv.category),
      item_code: srv.id,
      item_name: srv.name,
      description: srv.remark || srv.category || '',
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
  if (!isSupabaseConfigured || !supabase || !srvId) return;
  try {
    await supabase.from('items').delete().eq('item_id', srvId);
  } catch (err) {
    console.warn('Error deleting service addon from Supabase:', err);
  }
}

// 6.3 สถานที่ วัด และศาลา (TEMPLES, TEMPLE_IMAGES, PAVILIONS)
export async function syncSaveLocationToSupabase(loc) {
  if (!isSupabaseConfigured || !supabase || !loc) return;
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

    const targetTempleId = savedTemple?.temple_id || templeId;
    if (targetTempleId) {
      if (Array.isArray(loc.images) && loc.images.length > 0) {
        await supabase.from('temple_images').delete().eq('temple_id', targetTempleId);
        await supabase.from('temple_images').insert(
          loc.images.map((url, i) => ({
            temple_id: targetTempleId,
            image_url: url
            // sort_order: i + 1
          }))
        );
      }
      if (Array.isArray(loc.pavilions) && loc.pavilions.length > 0) {
        await supabase.from('pavilions').delete().eq('temple_id', targetTempleId);
        await supabase.from('pavilions').insert(
          loc.pavilions.map(p => ({
            temple_id: targetTempleId,
            pavilion_name: p.name,
            capacity: Number(p.capacity) || 150,
            status: p.isActive === false ? 'ปิดปรับปรุง' : 'ว่างพร้อมบริการ'
          }))
        );
      }
    }
  } catch (err) {
    console.warn('Error saving location to Supabase:', err);
  }
}

export async function syncDeleteLocationFromSupabase(locId) {
  if (!isSupabaseConfigured || !supabase || !locId) return;
  try {
    const templeId = Number(String(locId).replace(/\D/g, ''));
    if (templeId) {
      await supabase.from('temples').delete().eq('temple_id', templeId);
    }
  } catch (err) {
    console.warn('Error deleting location from Supabase:', err);
  }
}

// 6.4 แผนกและบุคลากร (DEPARTMENTS & COMMUNITY_WORKERS)
export async function syncAddDepartmentToSupabase(deptName) {
  if (!isSupabaseConfigured || !supabase || !deptName) return;
  try {
    const cleanName = deptName.replace(/^ฝ่าย/, '').trim();
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
  if (!isSupabaseConfigured || !supabase || !deptName) return;
  try {
    const cleanName = deptName.replace(/^ฝ่าย/, '').trim();
    await supabase.from('departments').delete().or(`department_name.eq.${cleanName},department_name.eq.${deptName}`);
  } catch (err) {
    console.warn('Error removing department from Supabase:', err);
  }
}

export async function syncSaveStaffMemberToSupabase(staffMember) {
  if (!isSupabaseConfigured || !supabase || !staffMember) return;
  try {
    const workerId = staffMember.workerId || Number(String(staffMember.id || '').replace(/\D/g, '')) || undefined;
    const nameParts = (staffMember.fullName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || staffMember.fullName || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload = {
      prefix: staffMember.prefix || 'นาง',
      first_name: firstName,
      last_name: lastName,
      full_name: staffMember.fullName,
      department_name: (staffMember.department || '').replace(/^ฝ่าย/, '').trim(),
      role_title: `หัวหน้า${staffMember.department || 'ฝ่าย'}`,
      phone: staffMember.phone || '',
      email: staffMember.email || '',
      address_detail: staffMember.address || '',
      subdistrict: staffMember.subdistrict || 'หนองหาร',
      district: staffMember.district || 'สันทราย',
      province: staffMember.province || 'เชียงใหม่',
      postal_code: staffMember.postalCode || '50290',
      status: 'พร้อมรับงาน'
    };
    if (workerId) payload.worker_id = workerId;

    await supabase.from('community_workers').upsert(payload, { onConflict: 'worker_id' });
  } catch (err) {
    console.warn('Error saving staff member to Supabase:', err);
  }
}

export async function syncDeleteStaffMemberFromSupabase(staffId) {
  if (!isSupabaseConfigured || !supabase || !staffId) return;
  try {
    const workerId = Number(String(staffId).replace(/\D/g, ''));
    if (workerId) {
      await supabase.from('community_workers').delete().eq('worker_id', workerId);
    }
  } catch (err) {
    console.warn('Error deleting staff member from Supabase:', err);
  }
}
