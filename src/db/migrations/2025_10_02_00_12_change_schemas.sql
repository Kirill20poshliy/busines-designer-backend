DO $$
DECLARE
    never_id INT;
    periodic_id INT;
    replacement_id INT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'documents'
            AND column_name = 'is_started'
    ) THEN
        ALTER TABLE documents
        ADD COLUMN is_started BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    SELECT 
        id INTO never_id 
    FROM trigger_types 
    WHERE name = 'Никогда';

    SELECT 
        id INTO periodic_id 
    FROM trigger_types 
    WHERE name = 'Периодично';
    
    SELECT id INTO replacement_id 
    FROM trigger_types 
    WHERE name NOT IN ('Никогда', 'Периодично') 
    LIMIT 1;

    IF replacement_id IS NOT NULL THEN
        IF never_id IS NOT NULL THEN
            UPDATE documents 
            SET trigger_type_id = replacement_id 
            WHERE trigger_type_id = never_id;

            DELETE FROM trigger_types 
            WHERE id = never_id;
        END IF;

        IF periodic_id IS NOT NULL THEN
            UPDATE documents 
            SET trigger_type_id = replacement_id 
            WHERE trigger_type_id = periodic_id;

            DELETE FROM trigger_types 
            WHERE id = periodic_id;
        END IF;
    ELSE
        IF never_id IS NOT NULL THEN
            UPDATE documents 
            SET trigger_type_id = NULL 
            WHERE trigger_type_id = never_id;

            DELETE FROM trigger_types 
            WHERE id = never_id;
        END IF;

        IF periodic_id IS NOT NULL THEN
            UPDATE documents 
            SET trigger_type_id = NULL 
            WHERE trigger_type_id = periodic_id;

            DELETE FROM trigger_types 
            WHERE id = periodic_id;
        END IF;
    END IF;
END;
$$;