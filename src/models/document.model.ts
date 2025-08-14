/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         content:
 *           type: string
 *         project_id:
 *           type: number
 *         author_id:
 *           type: number
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *         
 */
export interface IDocument {
    id: number;
    name: string;
    content: string;
    project_id: number;
    author_id: number;
    created_at: string;
    updated_at: string;
}