DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'tokens'
    ) THEN 
        DELETE FROM tokens;
    END IF;
END;
$$;