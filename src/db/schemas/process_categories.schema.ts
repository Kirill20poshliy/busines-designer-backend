export const ProcessCategoriesSchema = `
    CREATE TABLE IF NOT EXISTS process_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );
`;

export const ProcessCategoriesSchemaDrop = `
    DROP TABLE IF EXISTS process_categories;
`;
