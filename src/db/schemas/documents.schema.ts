export const DocumentSchema = `
    CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        content TEXT,
        project_id INTEGER,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        project_name VARCHAR(100),
        pict_url TEXT,
        author_id INTEGER,
        FOREIGN KEY (author_id) REFERENCES users(id),
        author_name VARCHAR(256),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
  
    CREATE INDEX IF NOT EXISTS idx_document_project ON documents(project_id);
    CREATE INDEX IF NOT EXISTS idx_document_author ON documents(author_id);
`;

export const DocumentSchemaDrop = `
    DROP INDEX IF EXISTS idx_document_project;
    DROP INDEX IF EXISTS idx_document_author;
    DROP TABLE IF EXISTS documents;
`;
