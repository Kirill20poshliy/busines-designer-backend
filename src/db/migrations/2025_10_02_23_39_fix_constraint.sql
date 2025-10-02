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

    ALTER TABLE documents 
    DROP CONSTRAINT IF EXISTS fk_doc_trigger_type;

    ALTER TABLE documents 
    DROP CONSTRAINT IF EXISTS documents_trigger_type_fkey;

    IF NOT EXISTS (SELECT 1 FROM trigger_types) THEN
        INSERT INTO trigger_types (name) VALUES ('never');
    END IF;

    DELETE FROM trigger_types WHERE name IN ('Никогда', 'Периодично');

    ALTER TABLE documents 
    ADD CONSTRAINT fk_documents_trigger_type 
    FOREIGN KEY (trigger_type) REFERENCES trigger_types(id) 
    ON DELETE SET NULL;

    UPDATE documents 
    SET trigger_type = (SELECT id FROM trigger_types ORDER BY id LIMIT 1)
    WHERE trigger_type IS NOT NULL 
        AND trigger_type NOT IN (SELECT id FROM trigger_types);
END;
$$;