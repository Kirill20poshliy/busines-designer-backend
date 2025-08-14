export const ProjectSchema = `
    CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        author_id INTEGER,
        FOREIGN KEY (author_id) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
  
    CREATE INDEX IF NOT EXISTS idx_project_author ON projects(author_id);
`;

export const ProjectSchemaDrop = `
    DROP INDEX IF EXISTS idx_project_author;
    DROP TABLE IF EXISTS projects;
`;
