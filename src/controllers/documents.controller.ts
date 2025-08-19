import { Request, Response } from "express";
import { IAuthRequest } from "../types/types";
import documentsService from "../services/documents.service";

class DocumentsController {
    async create(req: IAuthRequest, res: Response) {
        try {
            const { name, projectId } = req.body as { name: string, projectId: string };
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(400)
                    .json({ message: "Current user ID are required" });
            }

            const data = await documentsService.create(name, userId, projectId);

            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error creating document -> ${e}`,
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const { project_id } = req.query as { project_id: string };
            if (!project_id) {
                return res
                    .status(400)
                    .json({ message: "project_id query param are required" });
            }

            const data = await documentsService.getAll(project_id);

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

            const data = await documentsService.getOne(id);

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

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const data = await documentsService.updateName(
                id,
                name,
                userId
            );

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error updating document -> ${e}`,
            });
        }
    }

    async updateContent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { content } = req.body as { content: string };

            const data = await documentsService.updateContent(
                id,
                content,
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
            const { projectId } = req.body as { projectId: string };
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const data = await documentsService.updateProject(
                id,
                projectId,
                userId
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
            const filePath = req.file.path;
            const mimetype = req.file.mimetype;

            const data = await documentsService.updatePicture(userId, id, filePath, mimetype);

            res.status(201).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating document picture -> ${e}` });
        }
    }

    async deletePicture(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const { id } = req.params;

            if (!id) {
                return res
                    .status(400)
                    .json({ message: "Bad request" });
            }

            const data = await documentsService.deletePicture(id, userId);

            res.status(200).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error deleting document picture -> ${e}` });
        }
    }

    async delete(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const data = await documentsService.delete(id, userId);

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
