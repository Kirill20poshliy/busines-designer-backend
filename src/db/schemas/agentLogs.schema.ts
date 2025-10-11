export const AgentLogSchema = `
    CREATE TABLE IF NOT EXISTS agents_logs (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER NOT NULL,
        log_text TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_agents_logs_agent_id ON agents_logs(agent_id);
`;

export const AgentLogSchemaDrop = `
    DROP TABLE IF EXISTS agents_logs;
`;
