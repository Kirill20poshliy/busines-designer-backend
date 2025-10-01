DO $$
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

    IF EXISTS (
        SELECT 1
        FROM trigger_types
        WHERE name = 'Никогда'
    ) THEN
        DELETE FROM trigger_types
        WHERE name = 'Никогда';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM trigger_types
        WHERE name = 'Периодично'
    ) THEN
        DELETE FROM trigger_types
        WHERE name = 'Периодично';
    END IF;
END;
$$;