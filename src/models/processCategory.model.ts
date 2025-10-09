/**
 * @swagger
 * components:
 *   schemas:
 *     ProcessCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 */
export interface IProcessCategory {
    id: string;
    name: string;
    description: string;
    created_at: string;
}