import { Router } from "express";
import triggerTypesController from "../controllers/triggerTypes.controller";

const triggersRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Triggers
 *   description: Управление триггерами
 */

/**
 * @swagger
 * /api/triggers:
 *   post:
 *     summary: Создать триггер
 *     tags: [Triggers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - projectId
 *             properties:
 *               name:
 *                 type: string
 *               projectId:
 *                 type: number
 *               desc:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trigger created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
triggersRouter.post("/", triggerTypesController.create);

/**
 * @swagger
 * /api/triggers:
 *   get:
 *     summary: Получить список доступных триггеров документа
 *     tags: [Triggers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TriggerType'
 */
triggersRouter.get("/", triggerTypesController.getAll);

/**
 * @swagger
 * /api/triggers/{id}:
 *   get:
 *     summary: Получить триггер по ID
 *     tags: [Triggers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID типа триггера
 *     responses:
 *       200:
 *         description: Trigger data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TriggerType'
 *       404:
 *         description: Bad request
 */
triggersRouter.get("/:id", triggerTypesController.getOne);

export { triggersRouter }