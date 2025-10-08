import { pool } from "../db";
import { IDocument } from "../models/document.model";

class AgentsDBService {
    async getAllActiveAgents(): Promise<IDocument[]> {
        const agents = await pool.query<IDocument>(`
            WITH agent_category AS (
                SELECT id
                FROM process_categories
                WHERE name = 'agent'
            )

            SELECT 
                d.*
            FROM documents d
                JOIN agent_category ac ON ac.id = d.category_id
            WHERE is_started = true`
        )
        return agents.rows
    }

    async getAgent(id: string): Promise<IDocument> {
        const agents = await pool.query<IDocument>(`
            SELECT *
            FROM documents
            WHERE id = $1`,
            [id]
        )
        return agents.rows[0]
    }

    async run(id: string): Promise<{is_running: boolean}> {
        const data = await pool.query<{is_running: boolean}>(`
            UPDATE documents
            SET is_running = true
            WHERE id = $1
            RETURNING is_running`,
            [id]
        )

        if (!data.rows.length) {
            throw new Error(`Error while agent "${id}" running`)
        }

        return data.rows[0]
    }

    async stop(id: string): Promise<{is_running: boolean}> {
        const data = await pool.query<{is_running: boolean}>(`
            UPDATE documents
            SET is_running = false
            WHERE id = $1
            RETURNING is_running`,
            [id]
        )

        if (!data.rows.length) {
            throw new Error(`Error while agent "${id}" stopping`)
        }

        return data.rows[0]
    }

    async updateLastRunDate(id: string): Promise<{last_run_date: string}> {
        const data = await pool.query<{last_run_date: string}>(`
            UPDATE documents
            SET last_run_date = NOW()
            WHERE id  = $1
            RETURNING last_run_date`,
            [id]
        )

        if (!data.rows.length) {
            throw new Error(`Error while agent "${id}" last_run_date updating`);
        }

        return data.rows[0]
    }

    async updateNextRunDate(id: string) {
        const data = await pool.query<{last_run_date: string}>(`
            WITH agent_period AS (
                SELECT 
                    CASE
                        WHEN last_run_date IS NOT NULL
                        THEN last_run_date
                        ELSE NOW()
                    END AS last_run,
                    "period"
                FROM documents
                WHERE id = $1
            )

            UPDATE documents
            SET next_run_date = (
                SELECT 
                    last_run + ("period" || ' milliseconds')::INTERVAL
                FROM agent_period
            )
            WHERE id = $1
            RETURNING next_run_date`,
            [id]
        )
        
        if (!data.rows.length) {
            throw new Error(`Error while agent "${id}" next_run_date updating`);
        }

        return data.rows[0]
    }
}

export default new AgentsDBService()