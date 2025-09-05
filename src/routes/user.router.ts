import { Router } from "express";
import userController from "../controllers/user.controller";
import { uploadPhoto } from "../middleware/files.middleware";

const usersRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserInfo'
 */
usersRouter.get("/", userController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       404:
 *         description: Bad request
 */
usersRouter.get("/:id", userController.getOne);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Current user profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       404:
 *         description: Bad request
 */
usersRouter.get("/profile", userController.getProfile);

/**
 * @swagger
 * /api/users/email:
 *   patch:
 *     summary: Изменить email пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Updated successfully
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
usersRouter.patch("/email", userController.updateEmail);

/**
 * @swagger
 * /api/users/password:
 *   patch:
 *     summary: Изменить password пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - newPassword
 *             properties:
 *               password:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
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
usersRouter.patch("/password", userController.updatePassword);

/**
 * @swagger
 * /api/users/firstname:
 *   patch:
 *     summary: Изменить Имя пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *             properties:
 *               firstname:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
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
usersRouter.patch("/firstname", userController.updateFirstname);

/**
 * @swagger
 * /api/users/lastname:
 *   patch:
 *     summary: Изменить Фамилию пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lastname
 *             properties:
 *               lastname:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
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
usersRouter.patch("/lastname", userController.updateLastname);

/**
 * @swagger
 * /api/users/avatar:
 *   patch:
 *     summary: Изменить avatar пользователя
 *     tags: [Users]
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
 *         description: Updated successfully
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
usersRouter.patch("/avatar", uploadPhoto, userController.updateAvatar);

/**
 * @swagger
 * /api/users/avatar:
 *   delete:
 *     summary: Удалить avatar пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Deleted successfully
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
usersRouter.delete("/avatar", userController.deleteAvatar);

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Изменить Профиль пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
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
usersRouter.patch("/profile", userController.updateProfile)

export { usersRouter };
