export const FileSchema = `
    CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        object_type VARCHAR(64) NOT NULL,
        url TEXT,
        object_id INTEGER,
        author_id INTEGER,
        FOREIGN KEY (author_id) REFERENCES users(id),
        mime_type VARCHAR(64),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
  
    CREATE INDEX IF NOT EXISTS idx_file_object ON files(object_id);
    CREATE INDEX IF NOT EXISTS idx_file_object_type ON files(object_type);
`;

export const FileSchemaDrop = `
    DROP INDEX IF EXISTS idx_file_object;
    DROP INDEX IF EXISTS idx_file_object_type;
    DROP TABLE IF EXISTS documents;
`;