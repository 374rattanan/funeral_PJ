-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA (CLEAN CREATE TABLES ONLY)
-- ระบบจัดการงานศพครบวงจร (วิสาหกิจชุมชนบ้านวิเวก)
-- รองรับสคริปต์ supabase_seed_master_data.md 100% ทุกคอลัมน์
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. กลุ่มตารางแผนก เจ้าหน้าที่ชุมชน และผู้ใช้งานระบบ
-- ============================================================================

-- 1.1 ตารางแผนก (DEPARTMENTS)
CREATE TABLE IF NOT EXISTS public.departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 ตารางเจ้าหน้าที่/ผู้รับผิดชอบในชุมชน (COMMUNITY_WORKERS)
CREATE TABLE IF NOT EXISTS public.community_workers (
    worker_id SERIAL PRIMARY KEY,
    worker_code VARCHAR(30) UNIQUE,
    prefix VARCHAR(30),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200) NOT NULL,
    department_id INT REFERENCES public.departments(department_id) ON DELETE SET NULL,
    department_name VARCHAR(100),
    role_title VARCHAR(100) DEFAULT 'เจ้าหน้าที่ปฏิบัติงาน',
    phone VARCHAR(30),
    line_id VARCHAR(100),
    email VARCHAR(150),
    address_detail TEXT,
    subdistrict VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100) DEFAULT 'เชียงใหม่',
    postal_code VARCHAR(20),
    status VARCHAR(50) DEFAULT 'พร้อมรับงาน',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 ตารางบัญชีผู้ใช้งานระบบ (USERS_AUTH)
CREATE TABLE IF NOT EXISTS public.users_auth (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DEPARTMENT')),
    display_name VARCHAR(150),
    worker_id INT REFERENCES public.community_workers(worker_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. กลุ่มตารางสถานที่ (วัด) และศาลา
-- ============================================================================

-- 2.1 ตารางสถานที่/วัด (TEMPLES)
CREATE TABLE IF NOT EXISTS public.temples (
    temple_id SERIAL PRIMARY KEY,
    temple_code VARCHAR(30) UNIQUE,
    temple_name VARCHAR(200) NOT NULL,
    temple_type VARCHAR(100) DEFAULT 'วัด',
    contact_person VARCHAR(150),
    phone VARCHAR(30),
    address_detail TEXT,
    subdistrict VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100) DEFAULT 'เชียงใหม่',
    postal_code VARCHAR(20),
    map_url TEXT,
    additional_details TEXT,
    status VARCHAR(50) DEFAULT 'เปิดให้บริการ',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 ตารางรูปภาพสถานที่ (TEMPLE_IMAGES)
CREATE TABLE IF NOT EXISTS public.temple_images (
    image_id SERIAL PRIMARY KEY,
    temple_id INT NOT NULL REFERENCES public.temples(temple_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 ตารางศาลา/โซนในวัด (PAVILIONS)
CREATE TABLE IF NOT EXISTS public.pavilions (
    pavilion_id SERIAL PRIMARY KEY,
    pavilion_code VARCHAR(30) UNIQUE,
    temple_id INT NOT NULL REFERENCES public.temples(temple_id) ON DELETE CASCADE,
    pavilion_name VARCHAR(150) NOT NULL,
    capacity INT DEFAULT 150,
    status VARCHAR(50) DEFAULT 'ว่างพร้อมบริการ',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. กลุ่มตารางพิธีกรรม หมวดหมู่ 10 หมวด คลังอุปกรณ์ และแพ็กเกจ
-- ============================================================================

-- 3.1 ตารางรูปแบบพิธีกรรม (RITUAL_TYPES)
CREATE TABLE IF NOT EXISTS public.ritual_types (
    ritual_id SERIAL PRIMARY KEY,
    ritual_code VARCHAR(50) UNIQUE NOT NULL,
    ritual_name VARCHAR(200) NOT NULL,
    description TEXT,
    upgrade_price NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 ตารางหมวดหมู่บริการ 10 หมวด (SERVICE_CATEGORIES)
CREATE TABLE IF NOT EXISTS public.service_categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(200) NOT NULL,
    addon_group_name VARCHAR(200),
    sort_order INT DEFAULT 1
);

-- 3.3 ตารางคลังรายการบริการและอุปกรณ์ (ITEMS)
CREATE TABLE IF NOT EXISTS public.items (
    item_id VARCHAR(50) PRIMARY KEY,
    category_id INT NOT NULL REFERENCES public.service_categories(category_id) ON DELETE RESTRICT,
    item_code VARCHAR(20),
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) DEFAULT 'ชุด',
    base_price NUMERIC(10, 2) DEFAULT 0.00,
    is_addon_available BOOLEAN DEFAULT FALSE,
    addon_remark VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 ตารางแพ็กเกจ (PACKAGES)
CREATE TABLE IF NOT EXISTS public.packages (
    package_id VARCHAR(50) PRIMARY KEY,
    package_name VARCHAR(150) NOT NULL,
    overview_description TEXT,
    target_group VARCHAR(150),
    base_price NUMERIC(10, 2) NOT NULL,
    duration VARCHAR(100),
    duration_days INT NOT NULL,
    duration_nights INT NOT NULL,
    base_guests INT NOT NULL,
    max_guests INT,
    default_ritual_id INT REFERENCES public.ritual_types(ritual_id) ON DELETE SET NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    cover_image_url TEXT,
    brochure_pdf_url TEXT,
    status VARCHAR(50) DEFAULT 'ใช้งาน',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 ตารางรายการที่อยู่ในแต่ละแพ็กเกจ พร้อมตารางแจกแจงรายวัน (PACKAGE_ITEMS)
CREATE TABLE IF NOT EXISTS public.package_items (
    id SERIAL PRIMARY KEY,
    package_id VARCHAR(50) NOT NULL REFERENCES public.packages(package_id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES public.items(item_id) ON DELETE CASCADE,
    qty INT DEFAULT 1,
    item_price NUMERIC(10, 2) DEFAULT 0.00,
    is_included BOOLEAN DEFAULT TRUE,
    day_1 BOOLEAN DEFAULT FALSE,
    night_1 BOOLEAN DEFAULT FALSE,
    day_2 BOOLEAN DEFAULT FALSE,
    night_2 BOOLEAN DEFAULT FALSE,
    day_3 BOOLEAN DEFAULT FALSE,
    night_3 BOOLEAN DEFAULT FALSE,
    cremation_day BOOLEAN DEFAULT FALSE,
    bone_collection_day BOOLEAN DEFAULT FALSE,
    UNIQUE (package_id, item_id)
);

-- ============================================================================
-- 4. กลุ่มตารางข้อมูลผู้ติดต่อ ผู้เสียชีวิต และใบจองงานศพหลัก
-- ============================================================================

-- 4.1 ตารางข้อมูลผู้ติดต่อ/เจ้าภาพ (CONTACT_PERSONS)
CREATE TABLE IF NOT EXISTS public.contact_persons (
    contact_id SERIAL PRIMARY KEY,
    prefix VARCHAR(30),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    backup_phone VARCHAR(30),
    line_id VARCHAR(100),
    email VARCHAR(150),
    address_detail TEXT,
    subdistrict VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 ตารางข้อมูลผู้เสียชีวิต (DECEASED_PERSONS)
CREATE TABLE IF NOT EXISTS public.deceased_persons (
    deceased_id SERIAL PRIMARY KEY,
    prefix VARCHAR(30),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(20),
    gender VARCHAR(20),
    birth_date DATE,
    age INT,
    death_date DATE,
    death_time TIME,
    place_of_death VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 ตารางใบงานศพหลัก (FUNERALS)
CREATE TABLE IF NOT EXISTS public.funerals (
    funeral_id SERIAL PRIMARY KEY,
    funeral_code VARCHAR(50) UNIQUE NOT NULL,
    req_number VARCHAR(50) UNIQUE,
    contact_id INT REFERENCES public.contact_persons(contact_id) ON DELETE SET NULL,
    contact_relationship VARCHAR(100),
    deceased_id INT REFERENCES public.deceased_persons(deceased_id) ON DELETE SET NULL,
    package_id VARCHAR(50) REFERENCES public.packages(package_id) ON DELETE SET NULL,
    selected_ritual_id INT REFERENCES public.ritual_types(ritual_id) ON DELETE SET NULL,
    temple_id INT REFERENCES public.temples(temple_id) ON DELETE SET NULL,
    pavilion_id INT REFERENCES public.pavilions(pavilion_id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    cremation_date DATE,
    bone_collection_date DATE,
    end_date DATE,
    duration_days INT DEFAULT 3,
    base_guests INT DEFAULT 50,
    extra_guests INT DEFAULT 0,
    expected_guests INT DEFAULT 50,
    package_amount NUMERIC(10, 2) DEFAULT 0.00,
    ritual_upgrade_amount NUMERIC(10, 2) DEFAULT 0.00,
    addons_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    -- ข้อมูลวันนัดหมายและรูปแบบการชำระเงิน (Step 4)
    appointment_date DATE,
    appointment_time VARCHAR(50),
    payment_plan VARCHAR(30) DEFAULT 'full' CHECK (payment_plan IN ('full', 'installment')),
    installment1_percent INT DEFAULT 100,
    status VARCHAR(50) DEFAULT 'รออนุมัติ',
    special_instructions TEXT,
    rejection_or_revision_note TEXT,
    close_summary TEXT,
    quotation_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 ตารางรายการบริการเสริมที่ลูกค้าสั่งเพิ่มในแต่ละงาน (FUNERAL_ADDONS)
CREATE TABLE IF NOT EXISTS public.funeral_addons (
    id SERIAL PRIMARY KEY,
    funeral_id INT NOT NULL REFERENCES public.funerals(funeral_id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES public.items(item_id) ON DELETE RESTRICT,
    qty INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.5 ตารางเอกสารสำคัญประกอบการจอง (FUNERAL_DOCUMENTS)
CREATE TABLE IF NOT EXISTS public.funeral_documents (
    doc_id SERIAL PRIMARY KEY,
    funeral_id INT NOT NULL REFERENCES public.funerals(funeral_id) ON DELETE CASCADE,
    doc_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.6 ตารางการชำระเงินเต็มจำนวน หรือแบ่งชำระ 2 งวด (PAYMENTS)
CREATE TABLE IF NOT EXISTS public.payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    funeral_id INT NOT NULL REFERENCES public.funerals(funeral_id) ON DELETE CASCADE,
    installment_no INT NOT NULL CHECK (installment_no IN (1, 2)),
    installment_percent INT DEFAULT 100,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(100) DEFAULT 'โอนเงินผ่านธนาคาร',
    reference_number VARCHAR(100),
    payment_proof_url TEXT,
    payment_status VARCHAR(50) DEFAULT 'รอดำเนินการ',
    rejection_reason TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.7 ตารางไทม์ไลน์ติดตามความคืบหน้าการจัดงาน 8 ขั้นตอน (FUNERAL_TIMELINES)
CREATE TABLE IF NOT EXISTS public.funeral_timelines (
    timeline_id SERIAL PRIMARY KEY,
    funeral_id INT NOT NULL REFERENCES public.funerals(funeral_id) ON DELETE CASCADE,
    step_no INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    responsible_info VARCHAR(200),
    status VARCHAR(50) DEFAULT 'รอดำเนินงาน',
    display_date VARCHAR(100),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. กลุ่มตารางการมอบหมายงานให้ฝ่ายต่างๆ และรายงานความคืบหน้า
-- ============================================================================

-- 5.1 ตารางใบงานย่อยที่มอบหมายให้ฝ่ายต่างๆ (WORK_TASKS)
CREATE TABLE IF NOT EXISTS public.work_tasks (
    task_id VARCHAR(50) PRIMARY KEY,
    funeral_id INT NOT NULL REFERENCES public.funerals(funeral_id) ON DELETE CASCADE,
    task_seq INT NOT NULL DEFAULT 1,
    title VARCHAR(200) NOT NULL,
    department_id INT REFERENCES public.departments(department_id) ON DELETE SET NULL,
    department_name VARCHAR(100),
    primary_worker_id INT REFERENCES public.community_workers(worker_id) ON DELETE SET NULL,
    priority VARCHAR(50) DEFAULT 'ปกติ',
    deadline TIMESTAMPTZ,
    work_date DATE,
    work_time VARCHAR(50),
    location_display VARCHAR(200),
    status VARCHAR(50) DEFAULT 'ยังไม่ได้มอบหมาย',
    current_step INT DEFAULT 1,
    notes TEXT,
    acknowledged_at TIMESTAMPTZ,
    review_status VARCHAR(50),
    review_feedback TEXT,
    reviewed_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 ตารางทีมผู้ช่วยในแต่ละใบงาน (TASK_ASSISTANTS)
CREATE TABLE IF NOT EXISTS public.task_assistants (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL REFERENCES public.work_tasks(task_id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES public.community_workers(worker_id) ON DELETE CASCADE,
    UNIQUE (task_id, worker_id)
);

-- 5.3 ตารางเช็กลิสต์ขั้นตอนการทำงานของฝ่าย (TASK_CHECKLISTS)
CREATE TABLE IF NOT EXISTS public.task_checklists (
    checklist_id SERIAL PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL REFERENCES public.work_tasks(task_id) ON DELETE CASCADE,
    timeline_id INT REFERENCES public.funeral_timelines(timeline_id) ON DELETE SET NULL,
    label VARCHAR(200) NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    completed_time VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.4 ตารางรูปภาพรายงานความคืบหน้าหน้างาน (TASK_PROGRESS_REPORTS)
CREATE TABLE IF NOT EXISTS public.task_progress_reports (
    report_id SERIAL PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL REFERENCES public.work_tasks(task_id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    description TEXT,
    submitted_by VARCHAR(150),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- เปิดใช้งาน Row Level Security (RLS) สำหรับทุกตาราง
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'departments', 'community_workers', 'users_auth', 'temples',
        'temple_images', 'pavilions', 'ritual_types', 'service_categories',
        'packages', 'items', 'package_items', 'contact_persons',
        'deceased_persons', 'funerals', 'funeral_addons', 'funeral_documents',
        'payments', 'funeral_timelines', 'work_tasks', 'task_checklists',
        'task_progress_reports', 'task_assistants'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow full access for anon and authenticated" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Allow full access for anon and authenticated" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;

-- ============================================================================
-- 6. ระบบอัปเดตแพ็กเกจแนะนำอัตโนมัติ (Trigger จากยอดจองสูงสุดในตาราง funerals)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_recommended_package_from_bookings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_top_package_id VARCHAR(50);
BEGIN
    SELECT f.package_id
    INTO v_top_package_id
    FROM public.funerals f
    WHERE f.package_id IS NOT NULL
      AND COALESCE(f.status, '') <> 'ยกเลิก'
    GROUP BY f.package_id
    ORDER BY COUNT(*) DESC,
             CASE WHEN f.package_id = 'PKG-03' THEN 0 ELSE 1 END ASC,
             f.package_id ASC
    LIMIT 1;

    IF v_top_package_id IS NULL THEN
        v_top_package_id := 'PKG-03';
    END IF;

    UPDATE public.packages
    SET is_recommended = (package_id = v_top_package_id)
    WHERE package_id IS NOT NULL
      AND is_recommended IS DISTINCT FROM (package_id = v_top_package_id);

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_recommended_package ON public.funerals;

CREATE TRIGGER trg_update_recommended_package
AFTER INSERT OR UPDATE OF package_id, status OR DELETE
ON public.funerals
FOR EACH STATEMENT
EXECUTE FUNCTION public.update_recommended_package_from_bookings();
