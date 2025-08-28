/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         desc:
 *           type: string
 *         content:
 *           type: string
 *         project_id:
 *           type: number
 *         project_name:
 *           type: string
 *         pict_url:
 *           type: string
 *         author_id:
 *           type: number
 *         author_name:
 *           type: string
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *         
 */
export interface IDocument {
    id: string;
    name: string;
    desc: string;
    content: string;
    project_id: number;
    project_name: string;
    pict_url: string | null;
    author_id: number;
    author_name: string;
    created_at: string;
    updated_at: string;
}