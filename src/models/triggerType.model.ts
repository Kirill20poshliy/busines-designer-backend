/**
 * @swagger
 * components:
 *   schemas:
 *     TriggerType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         created_at:
 *           type: string
 */
export interface ITriggerType {
    id: string;
    name: string;
    created_at: string;
}