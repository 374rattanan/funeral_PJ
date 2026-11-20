-- ============================================================================
-- 6. PRODUCTION RLS SECURITY GUIDE (สำหรับเปิดใช้งานเมื่อขึ้นระบบจริง Production)
-- คำเตือน: สคริปต์นี้ใช้คู่กับ Supabase Auth (auth.uid()) และตั้งค่า VITE_DEMO_MODE=false
-- อย่ารันสคริปต์นี้ในระหว่างที่ยังใช้ระบบล็อกอินเดโมแบบไม่มี Supabase Auth Session
-- ============================================================================

-- แนวทางยกระดับความปลอดภัยเมื่อนำขึ้นใช้งานจริง:
-- 1. เปิดใช้งาน Supabase Auth (Email/Password) แล้วผูก auth_user_id ในตาราง public.users_auth
-- 2. แยกสิทธิ์ตารางเป็น 2 กลุ่ม:
--    กลุ่ม A (สาธารณะอ่านได้อย่างเดียว): packages, package_items, items, temples, temple_images, pavilions, ritual_types, service_categories, departments
--    กลุ่ม B (ข้อมูลส่วนบุคคลและงานภายใน): contact_persons, deceased_persons, funerals, funeral_addons, funeral_documents, payments, funeral_timelines, work_tasks, task_checklists, task_progress_reports, community_workers, users_auth
-- 3. สร้างฟังก์ชันช่วยเช็กสิทธิ์ Admin / Department จาก auth.uid()

/*
-- ตัวอย่าง Policy สำหรับ Production (นำ Comment ออกเมื่อผูก Supabase Auth เรียบร้อยแล้ว)

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users_auth WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ตัวอย่างตารางสาธารณะ (packages): ทุกคนดูได้ แต่เฉพาะ ADMIN ที่เพิ่ม/แก้/ลบได้
DROP POLICY IF EXISTS "Allow full access for anon and authenticated" ON public.packages;
CREATE POLICY "Public read active packages" ON public.packages
  FOR SELECT USING (true);
CREATE POLICY "Admin full manage packages" ON public.packages
  FOR ALL USING (public.current_user_role() = 'ADMIN')
  WITH CHECK (public.current_user_role() = 'ADMIN');

-- ตัวอย่างตารางข้อมูลลูกค้า (contact_persons / deceased_persons):
-- ลูกค้าส่งคำขอจองใหม่ (INSERT) ได้ แต่การอ่าน/แก้ไข/ลบ ต้องเป็นเจ้าหน้าที่ (ADMIN / DEPARTMENT)
DROP POLICY IF EXISTS "Allow full access for anon and authenticated" ON public.contact_persons;
CREATE POLICY "Public create contact on booking" ON public.contact_persons
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read contact" ON public.contact_persons
  FOR SELECT USING (public.current_user_role() IN ('ADMIN', 'DEPARTMENT'));
CREATE POLICY "Admin update delete contact" ON public.contact_persons
  FOR ALL USING (public.current_user_role() = 'ADMIN');
*/
