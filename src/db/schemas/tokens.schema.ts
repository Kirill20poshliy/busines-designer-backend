export const TokenSchema = `
    CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(512) UNIQUE NOT NULL,
        device_info VARCHAR(255),
        ip_address VARCHAR(45),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        revoked BOOLEAN DEFAULT false
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON tokens(token);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON tokens(expires_at);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON tokens(revoked);
`;

export const TokenSchemaDrop = `
    DROP TABLE IF EXISTS tokens;
`;
