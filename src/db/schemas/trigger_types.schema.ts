export const TriggerTypesSchema = `
    DO $$
    BEGIN
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
    END;
    $$;
`;

export const TriggerTypesSchemaDrop = `
    DROP TABLE IF EXISTS trigger_types;
`;
