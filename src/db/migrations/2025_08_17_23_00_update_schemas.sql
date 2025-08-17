ALTER TABLE users
ADD COLUMN firstname VARCHAR(128),
ADD COLUMN lastname VARCHAR(128),
ADD COLUMN name VARCHAR(256);

ALTER TABLE projects
ADD COLUMN pict_url TEXT,
ADD COLUMN author_name VARCHAR(256);

ALTER TABLE documents
ADD COLUMN project_name VARCHAR(100),
ADD COLUMN pict_url TEXT,
ADD COLUMN author_name VARCHAR(256);

CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    type VARCHAR(64) UNIQUE NOT NULL,
    url TEXT,
    object_id INTEGER,
    author_id INTEGER,
    FOREIGN KEY (author_id) REFERENCES users(id),
    mime_type VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_file_object ON files(object_id);
CREATE INDEX IF NOT EXISTS idx_file_type ON files(type);

