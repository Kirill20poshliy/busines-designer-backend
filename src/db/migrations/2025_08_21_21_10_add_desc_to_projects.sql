DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'documents'
            AND column_name = 'desc'
    ) THEN
        ALTER TABLE documents
        ADD COLUMN "desc" TEXT;
    END IF;
END;
$$