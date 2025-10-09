DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'process_categories'
            AND column_name = 'description'
    ) THEN
        ALTER TABLE process_categories
        ADD COLUMN "description" TEXT;
    END IF;
END;
$$;