import { Router } from "express";
import projectsController from "../controllers/projects.controller";

const projectsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Управление проектами
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Получить список всех проектов
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
*/
projectsRouter.get("/", projectsController.getAll);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Создать проект
 *     tags: [Projects]
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
 *         description: Project created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
projectsRouter.post("/", projectsController.create);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Получить проект по ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID проекта
 *     responses:
 *       200:
 *         description: Project data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Bad request
 */
projectsRouter.get("/:id", projectsController.getOne);

/**
 * @swagger
 * /api/projects/{id}/name:
 *   patch:
 *     summary: Изменить название проекта
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID проекта
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
 *       200:
 *         description: Project data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                    type: string
 *       404:
 *         description: Bad request
 */
projectsRouter.patch("/:id/name", projectsController.updateName);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Удалить проект
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID проекта
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Bad request
 */
projectsRouter.delete("/:id", projectsController.delete);

export { projectsRouter }
