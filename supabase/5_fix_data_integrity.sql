-- ============================================================================
-- 5. FIX DATA INTEGRITY, STANDARDIZE 8 DEPARTMENTS & CLEANUP DUPLICATES
-- วิธีใช้: คัดลอกโค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor บนเว็บ Supabase แล้วกด Run 1 ครั้ง
-- ============================================================================

-- 1. ยืนยันคอลัมน์ที่จำเป็นในตาราง payments และ funerals
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS installment_percent INT DEFAULT 100;
ALTER TABLE public.funerals ADD COLUMN IF NOT EXISTS appointment_date DATE;
ALTER TABLE public.funerals ADD COLUMN IF NOT EXISTS appointment_time VARCHAR(50);
ALTER TABLE public.funerals ADD COLUMN IF NOT EXISTS payment_plan VARCHAR(30) DEFAULT 'full';
ALTER TABLE public.funerals ADD COLUMN IF NOT EXISTS installment1_percent INT DEFAULT 100;

-- 2. ปรับชื่อแผนกทั้ง 8 ฝ่ายให้ตรงกับงานพิธีศพมาตรฐานทั้งระบบ
UPDATE public.departments SET department_name = 'สถานที่', description = 'จัดเตรียมศาลา โต๊ะ เก้าอี้ เต็นท์ และอำนวยความสะดวกพื้นที่' WHERE department_id = 1;
UPDATE public.departments SET department_name = 'หัตถกรรมและของชำร่วย', description = 'จัดเตรียมขันตั้ง สวยดอก ผ้าบังสุกุล สังฆทาน และของชำร่วย' WHERE department_id = 2;
UPDATE public.departments SET department_name = 'อาหารและเครื่องดื่ม', description = 'จัดเตรียมอาหารกลางวัน อาหารว่าง น้ำดื่ม และโรงครัว' WHERE department_id = 3;
UPDATE public.departments SET department_name = 'เครื่องเสียงและไฟฟ้า', description = 'ติดตั้งระบบเสียง ไมโครโฟน แสงสว่าง และไฟฟ้าตลอดงาน' WHERE department_id = 4;
UPDATE public.departments SET department_name = 'พิธีการและศาสนา', description = 'ดูแลลำดับพิธีกรรม มัคนายก และประสานงานพระสงฆ์' WHERE department_id = 5;
UPDATE public.departments SET department_name = 'หีบศพและอุปกรณ์', description = 'เตรียมหีบศพ โลงเย็น ปราสาทศพ และอุปกรณ์ประกอบพิธี' WHERE department_id = 6;
UPDATE public.departments SET department_name = 'ดอกไม้และตกแต่ง', description = 'จัดดอกไม้หน้าหีบศพ กรอบรูป และตกแต่งสถานที่' WHERE department_id = 7;
UPDATE public.departments SET department_name = 'ยานพาหนะ', description = 'รถรับ-ส่งร่าง รถขบวนแห่ และอำนวยความสะดวกการเดินทาง' WHERE department_id = 8;

-- 3. อัปเดตเจ้าหน้าที่ให้ครบทั้ง 8 ฝ่าย พร้อมชื่อแผนกที่ตรงกัน
UPDATE public.community_workers SET department_id = 2, department_name = 'หัตถกรรมและของชำร่วย', role_title = 'หัวหน้าฝ่ายหัตถกรรมและของชำร่วย' WHERE worker_id = 1;
UPDATE public.community_workers SET department_id = 1, department_name = 'สถานที่', role_title = 'หัวหน้าฝ่ายสถานที่' WHERE worker_id = 2;
UPDATE public.community_workers SET department_id = 3, department_name = 'อาหารและเครื่องดื่ม', role_title = 'หัวหน้าฝ่ายอาหารและเครื่องดื่ม' WHERE worker_id = 3;
UPDATE public.community_workers SET department_id = 5, department_name = 'พิธีการและศาสนา', role_title = 'หัวหน้าฝ่ายพิธีการและศาสนา' WHERE worker_id = 4;

INSERT INTO public.community_workers (
    worker_id, worker_code, prefix, first_name, last_name, full_name,
    department_id, department_name, role_title, phone, province, district, subdistrict, postal_code, status
) VALUES
(5, 'STF-05', 'นาย', 'คำ', 'งามตา', 'ลุงคำ งามตา', 7, 'ดอกไม้และตกแต่ง', 'หัวหน้าฝ่ายดอกไม้และตกแต่ง', '082-333-4455', 'เชียงใหม่', 'สันทราย', 'หนองหาร', '50290', 'พร้อมปฏิบัติงาน'),
(6, 'STF-06', 'นาย', 'เอก', 'เสียงใส', 'ช่างเอก เสียงใส', 4, 'เครื่องเสียงและไฟฟ้า', 'หัวหน้าฝ่ายเครื่องเสียงและไฟฟ้า', '083-777-8899', 'เชียงใหม่', 'สันทราย', 'หนองหาร', '50290', 'พร้อมปฏิบัติงาน'),
(7, 'STF-07', 'นาย', 'มี', 'เดินทาง', 'ลุงมี เดินทาง', 8, 'ยานพาหนะ', 'หัวหน้าฝ่ายยานพาหนะ', '085-444-5566', 'เชียงใหม่', 'สันทราย', 'หนองหาร', '50290', 'พร้อมปฏิบัติงาน'),
(8, 'STF-08', 'นาย', 'แก้ว', 'บุญเรือง', 'ลุงแก้ว บุญเรือง', 6, 'หีบศพและอุปกรณ์', 'หัวหน้าฝ่ายหีบศพและอุปกรณ์', '087-666-7788', 'เชียงใหม่', 'สันทราย', 'หนองหาร', '50290', 'พร้อมปฏิบัติงาน')
ON CONFLICT (worker_id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    department_name = EXCLUDED.department_name,
    role_title = EXCLUDED.role_title;

SELECT setval('community_workers_worker_id_seq', (SELECT COALESCE(MAX(worker_id), 1) FROM public.community_workers));

-- 4. อัปเดตบัญชีผู้ใช้งานให้ครบทั้ง 8 ฝ่าย (ตาราง users_auth)
UPDATE public.users_auth SET display_name = 'ป้าฝ้าย ใจดี (ฝ่ายสถานที่)' WHERE username = 'venue_dept';
UPDATE public.users_auth SET display_name = 'ป้าไหม สุขใจ (ฝ่ายหัตถกรรมและของชำร่วย)' WHERE username = 'craft_dept';
UPDATE public.users_auth SET display_name = 'ป้านุ่น อิ่มบุญ (ฝ่ายอาหารและเครื่องดื่ม)' WHERE username = 'food_dept';
UPDATE public.users_auth SET display_name = 'ป้าหวาย มงคล (ฝ่ายพิธีการและศาสนา)' WHERE username = 'ritual_dept';

INSERT INTO public.users_auth (username, password_hash, role, display_name, worker_id) VALUES
('flower_dept', 'dept1234', 'DEPARTMENT', 'ลุงคำ งามตา (ฝ่ายดอกไม้และตกแต่ง)', 5),
('audio_dept', 'dept1234', 'DEPARTMENT', 'ช่างเอก เสียงใส (ฝ่ายเครื่องเสียงและไฟฟ้า)', 6),
('vehicle_dept', 'dept1234', 'DEPARTMENT', 'ลุงมี เดินทาง (ฝ่ายยานพาหนะ)', 7),
('coffin_dept', 'dept1234', 'DEPARTMENT', 'ลุงแก้ว บุญเรือง (ฝ่ายหีบศพและอุปกรณ์)', 8)
ON CONFLICT (username) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    worker_id = EXCLUDED.worker_id;

-- 5. ปรับชื่อแผนกในใบงาน work_tasks ให้มีคำว่า 'ฝ่าย' นำหน้าและตรงมาตรฐานเดียวกัน
UPDATE public.work_tasks
SET department_name = CASE
    WHEN department_name IN ('สถานที่', 'ฝ่ายสถานที่') THEN 'ฝ่ายสถานที่'
    WHEN department_name IN ('ยานพาหนะ', 'ฝ่ายยานพาหนะ', 'งานภายนอก', 'ฝ่ายงานภายนอก') THEN 'ฝ่ายยานพาหนะ'
    WHEN department_name IN ('หีบศพและอุปกรณ์', 'ฝ่ายหีบศพและอุปกรณ์', 'ดาครัว', 'ฝ่ายดาครัว') THEN 'ฝ่ายหีบศพและอุปกรณ์'
    WHEN department_name IN ('ดอกไม้และตกแต่ง', 'ฝ่ายดอกไม้และตกแต่ง', 'ตกแต่ง', 'ฝ่ายตกแต่ง') THEN 'ฝ่ายดอกไม้และตกแต่ง'
    WHEN department_name IN ('เครื่องเสียงและไฟฟ้า', 'ฝ่ายเครื่องเสียงและไฟฟ้า', 'อาหารว่าง', 'ฝ่ายอาหารว่าง') THEN 'ฝ่ายเครื่องเสียงและไฟฟ้า'
    WHEN department_name IN ('อาหารและเครื่องดื่ม', 'ฝ่ายอาหารและเครื่องดื่ม', 'อาหาร', 'ฝ่ายอาหาร') THEN 'ฝ่ายอาหารและเครื่องดื่ม'
    WHEN department_name IN ('หัตถกรรมและของชำร่วย', 'ฝ่ายหัตถกรรมและของชำร่วย', 'หัตถกรรม', 'ฝ่ายหัตถกรรม') THEN 'ฝ่ายหัตถกรรมและของชำร่วย'
    WHEN department_name IN ('พิธีการและศาสนา', 'ฝ่ายพิธีการและศาสนา', 'พิธีการ', 'ฝ่ายพิธีการ') THEN 'ฝ่ายพิธีการและศาสนา'
    ELSE department_name
END
WHERE department_name IS NOT NULL;

-- 6. แก้ไขตัวอักษรภาษาจีนที่หลุดอยู่ในเช็กลิสต์ ('ประกอบ仪式' -> 'ประกอบพิธี')
UPDATE public.task_checklists
SET label = REPLACE(label, 'ประกอบ仪式', 'ประกอบพิธี')
WHERE label LIKE '%ประกอบ仪式%';

-- 7. ล้างแถวข้อมูลซ้ำที่เกิดจาก Seed ซ้อนกัน (funeral_timelines, funeral_documents, funeral_addons)
DELETE FROM public.funeral_timelines a
USING public.funeral_timelines b
WHERE a.funeral_id = b.funeral_id
  AND a.step_no = b.step_no
  AND a.timeline_id > b.timeline_id;

DELETE FROM public.funeral_documents a
USING public.funeral_documents b
WHERE a.funeral_id = b.funeral_id
  AND a.doc_type = b.doc_type
  AND a.doc_id > b.doc_id;

DELETE FROM public.funeral_addons a
USING public.funeral_addons b
WHERE a.funeral_id = b.funeral_id
  AND a.item_id = b.item_id
  AND a.id > b.id;

-- ลบแถว contact_persons และ deceased_persons ที่ซ้ำและไม่ได้ถูกอ้างอิงโดย funerals
DELETE FROM public.contact_persons c
WHERE NOT EXISTS (SELECT 1 FROM public.funerals f WHERE f.contact_id = c.contact_id);

DELETE FROM public.deceased_persons d
WHERE NOT EXISTS (SELECT 1 FROM public.funerals f WHERE f.deceased_id = d.deceased_id);

-- 8. ปรับข้อมูล payment_plan / installment1_percent ในตาราง funerals ให้ตรงกับตาราง payments จริง
UPDATE public.funerals f
SET payment_plan = 'installment',
    installment1_percent = COALESCE(
        (SELECT p1.installment_percent FROM public.payments p1 WHERE p1.funeral_id = f.funeral_id AND p1.installment_no = 1 LIMIT 1),
        25
    )
WHERE EXISTS (
    SELECT 1 FROM public.payments p2 WHERE p2.funeral_id = f.funeral_id AND p2.installment_no = 2
);

-- สร้างแถว payments งวดที่ 1 ให้ใบจองที่ยังไม่มีแถวชำระเงิน (เช่น BW-00004)
INSERT INTO public.payments (
    payment_id, funeral_id, installment_no, installment_percent, paid_amount, payment_status
)
SELECT
    'PAY-' || COALESCE(f.req_number, f.funeral_code, 'BW-' || LPAD(f.funeral_id::text, 5, '0')) || '-1',
    f.funeral_id,
    1,
    COALESCE(f.installment1_percent, 100),
    COALESCE(f.total_amount, 0),
    CASE WHEN f.status = 'เสร็จสิ้น' THEN 'ชำระเงินแล้ว' ELSE 'รอดำเนินการ' END
FROM public.funerals f
WHERE NOT EXISTS (
    SELECT 1 FROM public.payments p WHERE p.funeral_id = f.funeral_id
)
ON CONFLICT (payment_id) DO NOTHING;

-- ปรับ extra_guests ของ BW-00002 ให้ตรงกับยอดสุทธิ 25,600 บาท (แพ็กเกจ 25,000 + เสริม 600)
UPDATE public.funerals
SET extra_guests = 0,
    expected_guests = base_guests
WHERE req_number = 'BW-00002'
  AND total_amount = 25600
  AND package_amount = 25000
  AND addons_amount = 600;
