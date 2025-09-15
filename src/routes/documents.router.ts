import { Router } from "express";
import documentsController from "../controllers/documents.controller";
import { uploadPhoto } from "../middleware/files.middleware";

const docsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Управление документами
 */

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Получить список документов проекта
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   $ref: '#components/schemas/Pagination'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 */
docsRouter.get("/", documentsController.getAll);

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Создать документ
 *     tags: [Documents]
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
 *         description: Document created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
docsRouter.post("/", documentsController.create);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Получить документ по ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     responses:
 *       200:
 *         description: Document data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       404:
 *         description: Bad request
 */
docsRouter.get("/:id", documentsController.getOne);

/**
 * @swagger
 * /api/documents/{id}/name:
 *   patch:
 *     summary: Изменить название документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
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
 *         description: Document data
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
docsRouter.patch("/:id/name", documentsController.updateName);

/**
 * @swagger
 * /api/documents/{id}/project:
 *   patch:
 *     summary: Изменить проект документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Document data
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
docsRouter.patch("/:id/project", documentsController.updateProject);

/**
 * @swagger
 * /api/documents/{id}/content:
 *   patch:
 *     summary: Изменить содержимое документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document data
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
docsRouter.patch("/:id/content", documentsController.updateContent);

/**
 * @swagger
 * /api/documents/{id}/desc:
 *   patch:
 *     summary: Изменить описание документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - desc
 *             properties:
 *               desc:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document data
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
docsRouter.patch("/:id/desc", documentsController.updateDesc);

/**
 * @swagger
 * /api/documents/{id}/trigger:
 *   patch:
 *     summary: Изменить тип триггера документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trigger_type
 *             properties:
 *               trigger_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document data
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
docsRouter.patch("/:id/trigger", documentsController.updateTrigger);

/**
 * @swagger
 * /api/documents/{id}/category:
 *   patch:
 *     summary: Изменить категорию документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *             properties:
 *               category_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document data
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
docsRouter.patch("/:id/category", documentsController.updateCategory);

/**
 * @swagger
 * /api/documents/{id}/period:
 *   patch:
 *     summary: Изменить период выполнения документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - period
 *             properties:
 *               period:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document data
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
docsRouter.patch("/:id/period", documentsController.updatePeriod);

/**
 * @swagger
 * /api/documents/{id}/picture:
 *   patch:
 *     summary: Изменить изображение документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
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
 *       200:
 *         description: Document data
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
docsRouter.patch(
    "/:id/picture",
    uploadPhoto,
    documentsController.updatePicture
);

/**
 * @swagger
 * /api/documents/{id}/picture:
 *   delete:
 *     summary: Удалить изображение документа
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     responses:
 *       200:
 *         description: Document data
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
docsRouter.delete("/:id/picture", documentsController.deletePicture);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Удалить документ
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID документа
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Bad request
 */
docsRouter.delete("/:id", documentsController.delete);

export { docsRouter };

