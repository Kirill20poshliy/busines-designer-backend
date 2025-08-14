import { pool } from "../db"
import { IProject } from "../models/project.model"

class ProjectsService {
    async create(name: string, authorId: number): Promise<{data: IProject}> {
        const optAuthorId = Number(authorId)

        const client = await pool.connect();
        const data = await client.query<IProject>(`
            INSERT INTO projects (
                name,
                author_id
            ) VALUES ($1, $2)
            RETURNING *`,
            [name, optAuthorId]
        )

        if (!data) {
            throw new Error('Error while creating project.')
        }

        return {data: data.rows[0]}
    }

    async getAll(userId: number): Promise<{data: IProject[]}> {
        const client = await pool.connect()
        const data = await client.query<IProject>(`
            SELECT
                id,
                name,
                author_id,
                created_at,
                updated_at
            FROM projects
            WHERE author_id = $1
            ORDER BY updated_at DESC`,
            [userId]
        )

        if (!data) {
            throw new Error('Error while getting projects.')
        }

        return {data: data.rows}
    }

    async getOne(id: number): Promise<{data: IProject}> {
        const client = await pool.connect()
        const data = await client.query<IProject>(`
            SELECT
                id,
                name,
                author_id,
                created_at,
                updated_at
            FROM projects
            WHERE id = $1
            LIMIT 1`,
            [id]
        )

        if (!data) {
            throw new Error(`Error while getting project "${id}".`)
        }

        return {data: data.rows[0] || null}
    }

    async updateName(id: number, name: string, authorId: number): Promise<{message: string}> {
        const client = await pool.connect()
        const data = await client.query(
            `
            UPDATE projects
            SET name = $1, updated_at = NOW()
            WHERE id = $2
                AND author_id = $3;`,
            [name, id, authorId]
        );

        if (!data) {
            throw new Error(`Error while project "${id}" name updating.`);
        }

        return {message: 'success'}
    }

    async delete(id: number, authorId: number) {
        const client = await pool.connect();
        const data = await client.query(`
            DELETE 
            FROM projects 
            WHERE id = $1
                AND author_id = $2`,
            [id, authorId]
        )

        if (!data) {
            throw new Error(`Error while project "${id}" deleteing.`)
        }

        return { message: "success" };
    }
}

export default new ProjectsService()