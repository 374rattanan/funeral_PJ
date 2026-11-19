-- ============================================================================
-- 3. AUTO-UPDATE RECOMMENDED PACKAGE TRIGGER (อัปเดตแพ็กเกจแนะนำอัตโนมัติตามยอดจองสูงสุด)
-- วิธีใช้: คัดลอกโค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor บนเว็บ Supabase แล้วกด Run
-- ============================================================================

-- 1. สร้างฟังก์ชันคำนวณแพ็กเกจที่ลูกค้าเลือกเยอะที่สุดจากตาราง funerals
CREATE OR REPLACE FUNCTION public.update_recommended_package_from_bookings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_top_package_id VARCHAR(50);
BEGIN
    -- หา package_id ที่มียอดจองสูงสุดในตาราง funerals (ไม่นับงานที่ยกเลิก)
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

    -- หากยังไม่มีใบจองในระบบเลย ให้ตั้งค่าเริ่มต้นเป็น PKG-03
    IF v_top_package_id IS NULL THEN
        v_top_package_id := 'PKG-03';
    END IF;

    -- อัปเดตคอลัมน์ is_recommended ในตาราง packages ให้เป็น TRUE เฉพาะแพ็กเกจอันดับ 1
    UPDATE public.packages
    SET is_recommended = (package_id = v_top_package_id)
    WHERE package_id IS NOT NULL
      AND is_recommended IS DISTINCT FROM (package_id = v_top_package_id);

    RETURN NULL;
END;
$$;

-- 2. สร้าง Trigger ให้ทำงานอัตโนมัติทุกครั้งที่มีการ เพิ่ม / แก้ไข / ลบ ข้อมูลในตาราง funerals
DROP TRIGGER IF EXISTS trg_update_recommended_package ON public.funerals;

CREATE TRIGGER trg_update_recommended_package
AFTER INSERT OR UPDATE OF package_id, status OR DELETE
ON public.funerals
FOR EACH STATEMENT
EXECUTE FUNCTION public.update_recommended_package_from_bookings();

-- 3. สั่งคำนวณและอัปเดตข้อมูลที่มีอยู่ปัจจุบันทันที 1 ครั้ง
DO $$
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
    WHERE package_id IS NOT NULL;
END $$;
