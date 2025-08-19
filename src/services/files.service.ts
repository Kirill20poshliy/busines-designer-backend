import { pool } from "../db";
import { IFile } from "../models/file.model";
import fs from "fs";

class FilesService {
    async upload(
        authorId: string,
        filePath: string,
        objectType: "user" | "project" | "document",
        objectId: string,
        mimetype: string
    ): Promise<{ photoId: string; photoUrl: string }> {
        const data = await pool.query<IFile>(
            `
            INSERT INTO files (
                object_type,
                url,
                object_id,
                author_id,
                mime_type
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [objectType, filePath, objectId ?? null, authorId, mimetype]
        );

        if (!data) {
            throw new Error("Error while uploading file.");
        }

        return {
            photoId: data.rows[0].id,
            photoUrl: `/api/files/${data.rows[0].id}`,
        };
    }

    async getFile(id: number): Promise<{url: string, mime_type: string}> {
        const data = await pool.query<IFile>(
            `
            SELECT 
                url,
                mime_type
            FROM files
            WHERE id = $1`,
            [id]
        );

        if (data.rows.length === 0) {
            throw new Error(`File with id: "${id}" not found`);
        }

        const { url, mime_type } = data.rows[0];

        if (!fs.existsSync(url)) {
            throw new Error(`File not found`);
        }

        return {
            url,
            mime_type
        }
    }

    async deleteFile(id: number, userId: number): Promise<void> {
        const check = await pool.query<IFile>(`
            SELECT 
                id,
                url,
                author_id
            FROM files
            WHERE id = $1`,
            [id]
        )

        if (check.rows.length === 0) {
            throw new Error(`File with id ${id} not found!`);
        }

        if (check.rows[0].author_id !== userId) {
            throw new Error('Permission denied');
        }

        const url = check.rows[0].url;

        await pool.query(`
            DELETE FROM files WHERE id = $1`,
            [id]
        )

        fs.unlink(url, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

    }
}

export default new FilesService();
