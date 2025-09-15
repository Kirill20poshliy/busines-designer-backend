export const ProcessCategoriesSchema = `
    DO $$
    BEGIN
        CREATE TABLE IF NOT EXISTS process_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        IF NOT EXISTS (
            SELECT 1
            FROM process_categories
            WHERE name = 'business_process'
        ) THEN
            INSERT INTO process_categories (name) VALUES ('business_process');
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM process_categories
            WHERE name = 'agent'
        ) THEN
            INSERT INTO process_categories (name) VALUES ('agent');
        END IF;
    END;
    $$;
`;

export const ProcessCategoriesSchemaDrop = `
    DROP TABLE IF EXISTS process_categories;
`;
