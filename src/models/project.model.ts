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
 *         author_id:
 *           type: number
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *         
 */
export interface IProject {
    id: number;
    name: string;
    author_id: number;
    created_at: string;
    updated_at: string;
}