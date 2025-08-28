import { pool } from "../db";
import { IProject } from "../models/project.model";
import { IPagination } from "../types/types";
import filesService from "./files.service";
import userService from "./user.service";

class ProjectsService {
    async create(name: string, authorId: string): Promise<{ data: IProject }> {
        const author = await userService.getOne(authorId);

        if (author.data === null) {
            throw new Error(`Project cannot exist without an author`);
        }

        const data = await pool.query<IProject>(
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

    async getAll(
        limit: string = "30",
        page: string = "1",
        field: string = "updated_at",
        order: string = "DESC",
        search: string = ""
    ): Promise<{ data: IProject[]; pagination: IPagination }> {
        const fields = ["name", "created_at", "updated_at"];
        const orders = ["ASC", "DESC"];

        const offset = (Number(page) - 1) * Number(limit);

        const sortField = fields.includes(field) ? field : "updated_at";
        const sortOrder = orders.includes(order.toUpperCase())
            ? order.toUpperCase()
            : "DESC";

        const data = await pool.query(
            `
            WITH projects_data AS (
                SELECT
                    id,
                    name,
                    author_id,
                    author_name,
                    pict_url,
                    created_at,
                    updated_at,
                    COUNT(*) OVER() as total_count
                FROM projects
                WHERE name ILIKE $3
                ORDER BY ${sortField} ${sortOrder}
                LIMIT $1
                OFFSET $2
            )
            SELECT
                json_agg(
                    json_build_object(
                        'id', id,
                        'name', name,
                        'author_id', author_id,
                        'author_name', author_name,
                        'pict_url', pict_url,
                        'created_at', created_at,
                        'updated_at', updated_at
                    )
                ) as data,
                MAX(total_count) as total_count
            FROM projects_data
            `,
            [limit, offset, `%${search}%`]
        );

        if (!data) {
            throw new Error("Error while getting projects.");
        }

        const total = Number(data.rows[0].total_count) || 0;
        const totalPages = Math.ceil(total / Number(limit));
        const currentPage = Number(page);

        const generateUrl = (pageNum: number): string => {
            const url = new URL("/api/projects", process.env.HOST);
            url.searchParams.set("limit", limit.toString());
            url.searchParams.set("page", pageNum.toString());
            url.searchParams.set("field", field);
            url.searchParams.set("order", order);
            if (search) {
                url.searchParams.set("search", search);
            }
            return url.pathname + url.search;
        };

        const prevPage = Number(page) > 1 ? Number(page) - 1 : null;
        const nextPage = Number(page) < totalPages ? Number(page) + 1 : null;

        return {
            pagination: {
                page: currentPage,
                limit: Number(limit),
                total,
                total_pages: totalPages,
                prev: prevPage ? generateUrl(prevPage) : null,
                next: nextPage ? generateUrl(nextPage) : null,
            },
            data: data.rows[0]?.data || [],
        };
    }

    async getOne(id: string): Promise<{ data: IProject }> {
        const data = await pool.query<IProject>(
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
        id: string,
        name: string,
        authorId: string
    ): Promise<{ message: string }> {
        const data = await pool.query(
            `
            UPDATE projects
            SET 
                name = $1, 
                updated_at = NOW()
            WHERE id = $2
                AND author_id = $3
            RETURNING *;`,
            [name, id, authorId]
        );

        if (!data.rows.length) {
            throw new Error(`Error while project "${id}" name updating.`);
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
            "project",
            objectId,
            mimetype
        );

        if (!fileData) {
            throw new Error(`Unable to upload file.`);
        }

        const data = await pool.query(
            `
            UPDATE projects
            SET 
                pict_url = $1, 
                updated_at = NOW()
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

    async deletePicture(
        projectId: string,
        authorId: string
    ): Promise<{ message: string }> {
        const deletable = await pool.query(
            `
            UPDATE projects
            SET 
                pict_url = null,
                updated_at = NOW()
            WHERE id = $1 
                AND author_id = $2
            RETURNING *`,
            [projectId, authorId]
        );

        if (!deletable.rows.length) {
            throw new Error(
                `Error while deleting project "${projectId}" picture`
            );
        }

        return { message: "success" };
    }

    async delete(id: number, authorId: number) {
        const data = await pool.query(
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

    async updateData(
        id: string,
        name: string,
        filePath: string | undefined,
        mimetype: string | undefined,
        userId: string
    ): Promise<{ message: string }> {
        if (filePath && mimetype) {
            await this.updatePicture(userId, id, filePath, mimetype);
        }

        const data = await pool.query(
            `
            UPDATE projects
            SET
                name = $1,
                updated_at = NOW()
            WHERE id = $2
                AND author_id = $3
            RETURNING *`,
            [name, id, userId]
        );

        if (!data.rows.length) {
            throw new Error(`Error while updateing project "${id}" data`);
        }

        return { message: "success" };
    }
}

export default new ProjectsService();

