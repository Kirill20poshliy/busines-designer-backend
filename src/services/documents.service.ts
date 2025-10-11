import { pool } from "../db";
import { IAgentLog } from "../models/agentLog.model";
import { IDocument } from "../models/document.model";
import { IPagination } from "../types/types";
import filesService from "./files.service";
import projectsService from "./projects.service";
import userService from "./user.service";

class DocumentsService {
    async create(
        name: string,
        authorId: string,
        projectId: string,
        desc: string,
        trigger_type: string,
        category_id: string,
        period: number,
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
                "desc",
                author_id,
                author_name,
                project_id,
                project_name,
                category_id,
                trigger_type,
                period
            ) VALUES (
                $1, 
                $2, 
                $3, 
                $4, 
                $5, 
                $6, 
                $7, 
                $8,
                $9
            )
            RETURNING *`,
            [
                name, 
                desc ?? null, 
                authorId, 
                author.data.name, 
                projectId, 
                project.data.name,
                category_id,
                trigger_type,
                period ?? null
            ]
        );

        if (!data.rows.length) {
            throw new Error("Error while creating document.");
        }

        return { data: data.rows[0] };
    }

    async getAll(
        projectId: string,
        limit: string = "30",
        page: string = "1",
        field: string = "updated_at",
        order: string = "DESC",
        search: string = ""
    ): Promise<{pagination: IPagination, data: Omit<IDocument, "content" | "category_id"> & {category: string}[] }> {
        const fields = ["name", "created_at", "updated_at"];
        const orders = ["ASC", "DESC"];
    
        const offset = (Number(page) - 1) * Number(limit);
    
        const sortField = fields.includes(field) ? field : "updated_at";
        const sortOrder = orders.includes(order.toUpperCase())
            ? order.toUpperCase()
            : "DESC";
        
        const data = await pool.query(
            `
            WITH documents_data AS (
                SELECT
                    d.id,
                    d.name,
                    d."desc",
                    d.project_id,
                    d.project_name,
                    d.author_id,
                    d.author_name,
                    tt.name AS trigger_type,
                    pc.name AS category,
                    d.period,
                    d.last_run_date,
                    d.next_run_date,
                    d.pict_url,
                    d.is_started,
                    d.is_running,
                    d.created_at,
                    d.updated_at,
                    COUNT(*) OVER() as total_count
                FROM documents d
                    LEFT JOIN trigger_types tt ON tt.id = d.trigger_type
					LEFT JOIN process_categories pc ON pc.id = d.category_id
                WHERE d.project_id = $1 
                    AND d.name ILIKE $4
                ORDER BY d.${sortField} ${sortOrder}
                LIMIT $2
                OFFSET $3
            )
            SELECT
                json_agg(
                    json_build_object(
                        'id', id,
                        'name', name,
                        'desc', "desc",
                        'project_id', project_id,
                        'project_name', project_name,
                        'author_id', author_id,
                        'author_name', author_name,
                        'trigger_type', trigger_type,
                        'category', category,
                        'period', period,
                        'last_run_date', last_run_date,
                        'next_run_date', next_run_date,
                        'is_started', is_started,
                        'is_running', is_running,
                        'pict_url', pict_url,
                        'created_at', created_at,
                        'updated_at', updated_at
                    )
                ) as data,
                MAX(total_count) as total_count
            FROM documents_data
            `,
            [projectId, limit, offset, `%${search}%`]
        );

        if (!data) {
            throw new Error("Error while getting documents.");
        }

        const total = Number(data.rows[0]?.total_count) || 0;
        const totalPages = Math.ceil(total / Number(limit));
        const currentPage = Number(page);

        const generateUrl = (pageNum: number): string => {
            const url = new URL(`/api/documents/${projectId}`, process.env.HOST);
            url.searchParams.set("project", projectId.toString());
            url.searchParams.set("limit", limit.toString());
            url.searchParams.set("page", pageNum.toString());
            url.searchParams.set("field", field);
            url.searchParams.set("order", order);
            if (search) {
                url.searchParams.set("search", search);
            }
            return url.pathname + url.search;
        };

        const prevPage = currentPage > 1 ? currentPage - 1 : null;
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;

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

    async getOne(id: string): Promise<{ data: Omit<IDocument, "category_id"> & {category: string} }> {
        const data = await pool.query<Omit<IDocument, "category_id"> & {category: string}>(
            `
            SELECT
                d.id,
                d.name,
                d."desc",
                d.content,
                d.project_id,
                d.project_name,
                d.author_id,
                d.author_name,
                tt.name AS trigger_type,
                pc.name AS category,
                d.period,
                d.last_run_date,
                d.next_run_date,
                d.pict_url,
                d.is_started,
                d.is_running,
                d.created_at,
                d.updated_at
            FROM documents d
                LEFT JOIN trigger_types tt ON tt.id = d.trigger_type
                LEFT JOIN process_categories pc ON pc.id = d.category_id
            WHERE d.id = $1
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
        authorId?: string
    ): Promise<{ message: string }> {
        const data = await pool.query(
            `
            UPDATE documents
            SET 
                name = $1, 
                updated_at = NOW()
            WHERE id = $2
                ${authorId && 'AND author_id = $3'}
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
                AND author_id = $3
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

    async updateDesc(id: string, desc: string): Promise<{ message: string }> {
        const data = await pool.query(
            `
            UPDATE documents
            SET 
                "desc" = $1, 
                updated_at = NOW()
            WHERE id = $2
            RETURNING *`,
            [desc, id]
        );

        if (!data.rows.length) {
            throw new Error(`Error while document "${id}" desc updating.`);
        }

        return { message: "success" };
    }

    async updateTrigger(id: string, trigger_type: string): Promise<{message: string}> {
        const data = await pool.query(
            `
            UPDATE documents
            SET 
                trigger_type = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING *`,
            [trigger_type, id]
        );

        if (!data.rows.length) {
            throw new Error(`Error while document "${id}" trigger updating.`);
        }

        return { message: "success" };        
    }

    async updateCategory(id: string, category_id: string): Promise<{message: string}> {
        const data = await pool.query(
            `
            UPDATE documents
            SET 
                category_id = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING *`,
            [category_id, id]
        );

        if (!data.rows.length) {
            throw new Error(`Error while document "${id}" category updating.`);
        }

        return { message: "success" };     
    }

    async updatePeriod(id: string, period: number | null): Promise<{message: string}> {
        const data = await pool.query(
            `
            UPDATE documents
            SET 
                period = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING *`,
            [period, id]
        );

        if (!data.rows.length) {
            throw new Error(`Error while document "${id}" period updating.`);
        }

        return { message: "success" }; 
    }

    async switchShedule(id: string): Promise<{is_started: boolean}> {
        const data = await pool.query<{is_started: boolean}>(`
            WITH is_agent_started AS (
                SELECT is_started status
                FROM documents
                WHERE id = $1
                LIMIT 1
            )

            UPDATE documents
            SET is_started = NOT (SELECT status FROM is_agent_started)
            WHERE id = $1
            RETURNING is_started`,
            [id]
        )

        if (!data.rows.length) {
            throw new Error(
                `Error while agent "${id}" shedule switching.`
            );
        }

        return {is_started: data.rows[0].is_started}
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
        const deletable = await pool.query(
            `
            UPDATE documents
            SET 
                pict_url = null,
                updated_at = NOW()
            WHERE id = $1 
                AND author_id = $2
            RETURNING *`,
            [documentId, authorId]
        );

        if (!deletable.rows.length) {
            throw new Error(
                `Error while deleting project "${documentId}" picture`
            );
        }

        return { message: "success" };
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

    async createAgentLog(agentId: string, text: string): Promise<{message: string}> {
        const createData = await pool.query(`
            INSERT 
            INTO agents_logs (
                agent_id,
                log_text
            )
            VALUES (
                $1,
                $2
            )
            RETURNING *`,
            [agentId, text]
        );
        
        if (!createData.rows.length) {
            return {
                message: 'failed'
            }
        }

        return {
            message: 'success'
        }
    }

    async getAgentLogs(id: string): Promise<IAgentLog[]> {
        const logs = await pool.query(`
            SELECT *
            FROM agents_logs
            WHERE agent_id = $1
                AND created_at >= NOW() - INTERVAL '7 days'
                AND created_at <= NOW()
            ORDER BY created_at`,
            [id]
        )

        return logs.rows
    }

    async deleteAgentLogs(id: string): Promise<{message: string}> {
        const logsDelete = await pool.query(`
            DELETE FROM agents_logs
            WHERE agent_id = $1
            RETURNING *`,
            [id]
        )

        if (!logsDelete.rows.length) {
            throw new Error(`Error while agent ${id} logs deleteing`);
        }

        return {message: 'success'};
    }
}

export default new DocumentsService();

