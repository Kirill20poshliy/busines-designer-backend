import { pool } from "../db";
import { IDocument } from "../models/document.model";
import filesService from "./files.service";
import projectsService from "./projects.service";
import userService from "./user.service";

class DocumentsService {
    async create(
        name: string,
        authorId: string,
        projectId: string
    ): Promise<{ data: IDocument }> {
        const author = await userService.getOne(authorId);

        if (author.data === null) {
            throw new Error(`Project cannot exist without an author`);
        }

        const project = await projectsService.getOne(projectId);

        if (project.data === null) {
            throw new Error("The specified project does not exist.");
        }

        const data = await pool.query<IDocument>(
            `
            INSERT INTO documents (
                name,
                author_id,
                author_name,
                project_id,
                project_name
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, authorId, author.data.name, projectId, project.data.name]
        );

        if (!data.rows.length) {
            throw new Error("Error while creating document.");
        }

        return { data: data.rows[0] };
    }

    async getAll(
        projectId: string
    ): Promise<{ data: Omit<IDocument, "content">[] }> {
        const data = await pool.query<Omit<IDocument, "content">>(
            `
            SELECT
                id,
                name,
                project_id,
                project_name,
                author_id,
                author_name,
                pict_url,
                created_at,
                updated_at
            FROM documents
            WHERE project_id = $1
            ORDER BY updated_at DESC`,
            [projectId]
        );

        if (!data) {
            throw new Error("Error while getting documents.");
        }

        return { data: data.rows };
    }

    async getOne(id: string): Promise<{ data: IDocument }> {
        const data = await pool.query<IDocument>(
            `
            SELECT
                id,
                name,
                project_id,
                project_name,
                author_id,
                author_name,
                pict_url,
                created_at,
                updated_at
            FROM documents
            WHERE id = $1
            LIMIT 1`,
            [id]
        );

        if (!data) {
            throw new Error(`Error while getting document "${id}".`);
        }

        return { data: data.rows[0] || null };
    }

    async updateName(
        id: string,
        name: string,
        authorId: string
    ): Promise<{ message: string }> {
        const data = await pool.query(
            `
            UPDATE documents
            SET 
                name = $1, 
                updated_at = NOW()
            WHERE id = $2
                AND author_id = $3;
            RETURNING *`,
            [name, id, authorId]
        );

        if (!data.rows.length) {
            throw new Error(`Error while document "${id}" name updating.`);
        }

        return { message: "success" };
    }

    async updateProject(
        id: string,
        projectId: string,
        authorId: string
    ): Promise<{ message: string }> {
        const data = await pool.query(
            `
            UPDATE documents
            SET 
                project_id = $1, 
                updated_at = NOW()
            WHERE id = $2
                AND author_id = $3;
            RETURNING *`,
            [projectId, id, authorId]
        );

        if (!data.rows.length) {
            throw new Error(`Error while document "${id}" project updating.`);
        }

        return { message: "success" };
    }

    async updateContent(
        id: string,
        content: string
    ): Promise<{ message: string }> {
        const data = await pool.query(
            `
            UPDATE documents
            SET 
                content = $1, 
                updated_at = NOW()
            WHERE id = $2
            RETURNING *`,
            [content, id]
        );

        if (!data.rows.length) {
            throw new Error(`Error while document "${id}" content updating.`);
        }

        return { message: "success" };
    }

    async updatePicture(
        userId: string,
        objectId: string,
        filePath: string,
        mimetype: string
    ): Promise<{ message: string }> {
        const fileData = await filesService.upload(
            userId,
            filePath,
            "document",
            objectId,
            mimetype
        );

        if (!fileData) {
            throw new Error(`Unable to upload file.`);
        }

        const data = await pool.query(
            `
            UPDATE documents
            SET 
                pict_url = $1,
                updated_at = NOW()
            WHERE id = $2
                AND author_id = $3
            RETURNING *`,
            [fileData.photoUrl, objectId, userId]
        );

        if (!data.rows.length) {
            throw new Error(
                `Error while document "${objectId}" picture updating.`
            );
        }

        return { message: "success" };
    }

    async deletePicture(documentId: string, authorId: string) {
        const deletable = await pool.query(`
            UPDATE documents
            SET 
                pict_url = null,
                updated_at = NOW()
            WHERE id = $1 
                AND author_id = $2
            RETURNING *`,
            [documentId, authorId]
        )

        if (!deletable.rows.length) {
            throw new Error(`Error while deleting project "${documentId}" picture`)
        }

        return { message: 'success' }
    }

    async delete(id: string, authorId: string) {
        const data = await pool.query(
            `
            DELETE 
            FROM documents 
            WHERE id = $1
                AND author_id = $2
            RETURNING *`,
            [id, authorId]
        );

        if (!data.rows.length) {
            throw new Error(`Error while document "${id}" deleteing.`);
        }

        return { message: "success" };
    }
}

export default new DocumentsService();
