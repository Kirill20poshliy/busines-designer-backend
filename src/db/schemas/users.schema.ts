export const UserSchema = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstname VARCHAR(128),
        lastname VARCHAR(128),
        name VARCHAR(256),
        pict_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
  
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

export const UserSchemaDrop = `
    DROP INDEX IF EXISTS idx_users_email;
    DROP TABLE IF EXISTS users;
`;
