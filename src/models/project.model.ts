/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         name:
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
export interface IProject {
    id: number;
    name: string;
    pict_url: string;
    author_id: number;
    author_name: string;
    created_at: string;
    updated_at: string;
}