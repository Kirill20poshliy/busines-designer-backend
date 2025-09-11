DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS process_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'documents'
            AND column_name = 'category_id'
    ) THEN
        ALTER TABLE documents
        ADD COLUMN category_id INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'documents'
            AND constraint_name = 'fk_doc_category_id'
            AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE documents
        ADD CONSTRAINT fk_doc_category_id
        FOREIGN KEY (category_id)
        REFERENCES process_categories(id);
    END IF;

    CREATE TABLE IF NOT EXISTS trigger_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );

    IF NOT EXISTS (
        SELECT 1
        FROM trigger_types
        WHERE name = 'Никогда'
    ) THEN
        INSERT INTO trigger_types (name) VALUES ('Никогда');
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM trigger_types
        WHERE name = 'Периодично'
    ) THEN
        INSERT INTO trigger_types (name) VALUES ('Периодично');
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'documents'
            AND column_name = 'trigger_type'
    ) THEN
        ALTER TABLE documents
        ADD COLUMN trigger_type INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'documents'
            AND constraint_name = 'fk_doc_trigger_type'
            AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE documents
        ADD CONSTRAINT fk_doc_trigger_type
        FOREIGN KEY (trigger_type)
        REFERENCES trigger_types(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'documents'
            AND column_name = 'period'
    ) THEN
        ALTER TABLE documents
        ADD COLUMN period BIGINT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'documents'
            AND column_name = 'last_run_date'
    ) THEN
        ALTER TABLE documents
        ADD COLUMN last_run_date TIMESTAMP;
    END IF;

END;
$$;