/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         token:
 *           type: string
 *         user_id:
 *           type: number
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *         
 */
export interface IToken {
    id: number,
    token: string,
    user_id: number,
    created_at: string,
    updated_at: string,
}