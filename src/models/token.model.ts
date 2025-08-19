/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       properties:
 *         id:
 *           type: string
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
    id: string,
    token: string,
    user_id: string,
    created_at: string,
    updated_at: string,
}