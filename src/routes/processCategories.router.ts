import { Router } from "express";
import processCategoriesController from "../controllers/processCategories.controller";

const processCategoriesRouter = Router();

/**
 * @swagger
 * tags:
 *   name: ProcessCategories
 *   description: Управление категориями процессов
 */

/**
 * @swagger
 * /api/process_categories:
 *   post:
 *     summary: Создать категорию процесса
 *     tags: [ProcessCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Process category created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
processCategoriesRouter.post("/", processCategoriesController.create);

/**
 * @swagger
 * /api/process_categories:
 *   get:
 *     summary: Получить список доступных категорий процессов
 *     tags: [ProcessCategories]
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
 *                     $ref: '#/components/schemas/ProcessCategory'
 */
processCategoriesRouter.get("/", processCategoriesController.getAll);

/**
 * @swagger
 * /api/process_categories/{id}:
 *   get:
 *     summary: Получить категорию процесса по ID
 *     tags: [ProcessCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID категории процесса
 *     responses:
 *       200:
 *         description: Process category data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessCategory'
 *       404:
 *         description: Bad request
 */
processCategoriesRouter.get("/:id", processCategoriesController.getOne);

export { processCategoriesRouter }