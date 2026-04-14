-- Backfill existing registrations with custom registration IDs
DO $$
DECLARE
    reg_record RECORD;
    new_custom_id TEXT;
BEGIN
    -- Loop through all registrations that don't have a custom_registration_id
    FOR reg_record IN 
        SELECT id, created_at
        FROM public.registrations
        WHERE custom_registration_id IS NULL
        ORDER BY created_at ASC
    LOOP
        -- Generate custom ID based on the registration's creation date
        new_custom_id := TO_CHAR(reg_record.created_at, 'YYYYMMDD') || LPAD(
            (SELECT COUNT(*) + 1 
             FROM public.registrations 
             WHERE custom_registration_id LIKE TO_CHAR(reg_record.created_at, 'YYYYMMDD') || '%'
            )::TEXT, 
            3, 
            '0'
        );
        
        -- Update the registration with the custom ID
        UPDATE public.registrations
        SET custom_registration_id = new_custom_id
        WHERE id = reg_record.id;
    END LOOP;
END $$;