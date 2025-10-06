DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'documents'
            AND column_name = 'next_run_date'
    ) THEN
        ALTER TABLE documents
        ADD COLUMN next_run_date TIMESTAMP;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'documents'
            AND column_name = 'is_running'
    ) THEN
        ALTER TABLE documents
        ADD COLUMN is_running BOOLEAN DEFAULT FALSE;
    END IF;
END;
$$;