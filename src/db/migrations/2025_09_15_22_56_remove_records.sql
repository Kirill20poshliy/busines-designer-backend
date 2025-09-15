DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM trigger_types
        WHERE name = 'Никогда'
    ) THEN
        DELETE 
        FROM trigger_types
        WHERE name = 'Никогда'
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM trigger_types
        WHERE name = 'Периодично'
    ) THEN
        DELETE
        FROM triggr_types
        WHERE name = 'Периодично'
    END IF;
END;
$$;