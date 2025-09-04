import express from "express";
import filesController from "../controllers/files.controller";
import { uploadPhoto } from "../middleware/files.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const filesRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Управление файлами
 */
/**
 * @swagger
 * /api/files:
 *   post:
 *     summary: Загрузить файл
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: object_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: object_id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Файл изображения (JPEG, PNG)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
filesRouter.post("/", authMiddleware, uploadPhoto, filesController.upload);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Получить файл по ID
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID файла
 *     responses:
 *       200:
 *         description: File data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       404:
 *         description: Bad request
 */
filesRouter.get("/:id", filesController.getFile);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Удалить файл
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID файла
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Bad request
 */
filesRouter.delete("/:id", authMiddleware, filesController.deleteFile);

export { filesRouter };
