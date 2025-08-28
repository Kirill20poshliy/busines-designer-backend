/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         pict_url:
 *           type: string
 *         author_id:
 *           type: string
 *         author_name:
 *           type: string
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *         
 */
export interface IProject {
    id: string;
    name: string;
    pict_url: string;
    author_id: string;
    author_name: string;
    created_at: string;
    updated_at: string;
}