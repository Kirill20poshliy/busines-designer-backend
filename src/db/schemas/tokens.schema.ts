export const TokenSchema = `
    CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(512) UNIQUE NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
`;

export const TokenSchemaDrop = `
    DROP TABLE IF EXISTS tokens;
`;
