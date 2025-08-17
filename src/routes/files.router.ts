import express from 'express';
import filesController from '../controllers/files.controller';
import { uploadPhoto } from '../utils/files';

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - objectType
 *               - objectId
 *             properties:
 *               objectType:
 *                 type: string
 *               objectId:
 *                 type: number
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
filesRouter.post('/', uploadPhoto, filesController.upload);

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
filesRouter.get('/:id', filesController.getFile);

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
filesRouter.delete('/:id', filesController.deleteFile);

export { filesRouter };