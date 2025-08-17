import { Request, Response } from "express";
import { IAuthRequest } from "../types/types";
import documentsService from "../services/documents.service";

class DocumentsController {
    async create(req: IAuthRequest, res: Response) {
        try {
            const { name, projectId } = req.body as { name: string, projectId: number };
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(400)
                    .json({ message: "Current user ID are required" });
            }

            const optUserId = Number(userId);

            const data = await documentsService.create(name, optUserId, projectId);

            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error creating document -> ${e}`,
            });
        }
    }

    async getAll(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(400)
                    .json({ message: "Current user ID are required" });
            }

            const optUserId = Number(userId);

            const data = await documentsService.getAll(optUserId);

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error getting documents -> ${e}`,
            });
        }
    }

    async getOne(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const data = await documentsService.getOne(Number(id));

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Error getting document -> ${e}` });
        }
    }

    async updateName(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { name } = req.body as { name: string };
            const userId = req.userId;
            const optUserId = Number(userId);

            const data = await documentsService.updateName(
                Number(id),
                name,
                optUserId
            );

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error updating document -> ${e}`,
            });
        }
    }

    async updateContent(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { content } = req.body as { content: string };
            const userId = req.userId;
            const optUserId = Number(userId);

            const data = await documentsService.updateContent(
                Number(id),
                content,
                optUserId
            );

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error updating document -> ${e}`,
            });
        }
    }

    async updateProject(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { projectId } = req.body as { projectId: number };
            const userId = req.userId;
            const optUserId = Number(userId);

            const data = await documentsService.updateProject(
                Number(id),
                Number(projectId),
                optUserId
            );

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error updating document -> ${e}`,
            });
        }
    }

    async updatePicture(req: IAuthRequest, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const userId = req.userId;

            if (!userId) {
                return res
                    .status(400)
                    .json({ message: "Current user ID are required" });
            }


            const { id } = req.params;
            const optUserId = Number(userId);
            const filePath = req.file.path;
            const mimetype = req.file.mimetype;

            const data = await documentsService.updatePicture(optUserId, Number(id), filePath, mimetype);

            res.status(201).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating document picture -> ${e}` });
                }
    }

    async delete(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            const optUserId = Number(userId);

            const data = await documentsService.delete(Number(id), optUserId);

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error deleteing document -> ${e}`,
            });
        }
    }
}

export default new DocumentsController();
