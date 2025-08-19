import { pool } from "../db";
import { IProject } from "../models/project.model";
import filesService from "./files.service";
import userService from "./user.service";

class ProjectsService {
    async create(name: string, authorId: string): Promise<{ data: IProject }> {
        const client = await pool.connect();

        const author = await userService.getOne(authorId);

        if (author.data === null) {
            throw new Error(`Project cannot exist without an author`)
        }

        const data = await client.query<IProject>(
            `
            INSERT INTO projects (
                name,
                author_id,
                author_name
            ) VALUES ($1, $2, $3)
            RETURNING *`,
            [name, Number(authorId), author.data.name]
        );

        if (!data) {
            throw new Error("Error while creating project.");
        }

        return { data: data.rows[0] };
    }

    async getAll(): Promise<{ data: IProject[] }> {
        const client = await pool.connect();
        const data = await client.query<IProject>(
            `
            SELECT
                id,
                name,
                author_id,
                author_name,
                pict_url,
                created_at,
                updated_at
            FROM projects
            ORDER BY updated_at DESC`
        );

        if (!data) {
            throw new Error("Error while getting projects.");
        }

        return { data: data.rows };
    }

    async getOne(id: string): Promise<{ data: IProject }> {
        const client = await pool.connect();
        const data = await client.query<IProject>(
            `
            SELECT
                id,
                name,
                author_id,
                author_name,
                pict_url,
                created_at,
                updated_at
            FROM projects
            WHERE id = $1
            LIMIT 1`,
            [id]
        );

        if (!data) {
            throw new Error(`Error while getting project "${id}".`);
        }

        return { data: data.rows[0] || null };
    }

    async updateName(
        id: number,
        name: string,
        authorId: number
    ): Promise<{ message: string }> {
        const client = await pool.connect();
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

        return { message: "success" };
    }

    async updatePicture(
        userId: number,
        objectId: number,
        filePath: string,
        mimetype: string
    ): Promise<{ message: string }> {
        const fileData = await filesService.upload(
            userId,
            filePath,
            "project",
            objectId,
            mimetype
        );

        if (!fileData) {
            throw new Error(`Unable to upload file.`);
        }

        const client = await pool.connect();

        const data = client.query(
            `
            UPDATE projects
            SET pict_url = $1
            WHERE id = $2`,
            [fileData.photoUrl, objectId]
        );

        if (!data) {
            throw new Error(
                `Error while project "${objectId}" picture updating.`
            );
        }

        return { message: "success" };
    }

    async delete(id: number, authorId: number) {
        const client = await pool.connect();
        const data = await client.query(
            `
            DELETE 
            FROM projects 
            WHERE id = $1
                AND author_id = $2`,
            [id, authorId]
        );

        if (!data) {
            throw new Error(`Error while project "${id}" deleteing.`);
        }

        return { message: "success" };
    }
}

export default new ProjectsService();
