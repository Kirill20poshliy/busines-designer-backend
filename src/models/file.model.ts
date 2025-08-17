/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         type:
 *           type: string
 *         url:
 *           type: string
 *         object_id:
 *           type: number
 *         author_id:
 *           type: number
 *         mime_type:
 *           type: string
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *         
 */
export interface IFile {
    id: number;
    type: string;
    url: string;
    object_id: number;
    author_id: number;
    mime_type: string;
    created_at: string;
    updated_at: string;
}