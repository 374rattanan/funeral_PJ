-- ============================================================================
-- 4. ENABLE HARD DELETE & CLEANUP SOFT-DELETED ROWS
-- วิธีใช้: คัดลอกโค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor บนเว็บ Supabase แล้วกด Run 1 ครั้ง
-- ============================================================================

-- 1. อัปเดตฟังก์ชัน Trigger แพ็กเกจแนะนำให้มี WHERE clause ชัดเจน (แก้ Error 21000 ตอนลบแพ็กเกจ)
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

-- 2. ยืนยัน RLS Policy ให้รองรับคำสั่ง DELETE ทุกตารางข้อมูลหลักของแอดมิน
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'packages',
        'package_items',
        'items',
        'temples',
        'temple_images',
        'pavilions',
        'departments',
        'community_workers'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow full access for anon and authenticated" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Allow full access for anon and authenticated" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;

-- 3. ลบแถวข้อมูลเก่าที่ค้างสถานะ 'ลบแล้ว' ออกจากฐานข้อมูลจริง (เฉพาะรายการที่ไม่ได้ถูกอ้างอิงในใบจอง)
DELETE FROM public.packages p
WHERE p.status = 'ลบแล้ว'
  AND NOT EXISTS (
      SELECT 1 FROM public.funerals f WHERE f.package_id = p.package_id
  );

DELETE FROM public.pavilions pv
WHERE pv.status = 'ลบแล้ว'
  AND NOT EXISTS (
      SELECT 1 FROM public.funerals f WHERE f.pavilion_id = pv.pavilion_id
  );

DELETE FROM public.temples t
WHERE t.status = 'ลบแล้ว'
  AND NOT EXISTS (
      SELECT 1 FROM public.funerals f WHERE f.temple_id = t.temple_id
  );

DELETE FROM public.community_workers w
WHERE w.status = 'ลบแล้ว'
  AND NOT EXISTS (
      SELECT 1 FROM public.work_tasks wt WHERE wt.primary_worker_id = w.worker_id
  )
  AND NOT EXISTS (
      SELECT 1 FROM public.task_assistants ta WHERE ta.worker_id = w.worker_id
  );

DELETE FROM public.departments d
WHERE d.is_active = FALSE
  AND NOT EXISTS (
      SELECT 1 FROM public.work_tasks wt WHERE wt.department_id = d.department_id
  );
