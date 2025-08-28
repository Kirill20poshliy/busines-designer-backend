import { Request, Response } from "express";
import { IAuthRequest } from "../types/types";
import projectsService from "../services/projects.service";

class ProjectsController {
    async create(req: IAuthRequest, res: Response) {
        try {
            const { name } = req.body as { name: string };
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const data = await projectsService.create(name, userId);

            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Error creating project -> ${e}` });
        }
    }

    async getAll(_req: Request, res: Response) {
        try {
            const data = await projectsService.getAll();

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Error getting projects -> ${e}` });
        }
    }

    async getOne(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res
                    .status(400)
                    .json({ message: "Bad request" });
            }

            const data = await projectsService.getOne(id);

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Error getting project -> ${e}` });
        }
    }

    async updateName(req: IAuthRequest, res: Response) {
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
            
            const { name } = req.body as { name: string };

            const data = await projectsService.updateName(
                id,
                name,
                userId
            );

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Error updating project -> ${e}` });
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
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const { id } = req.params;

            if (!id) {
                return res
                    .status(400)
                    .json({ message: "Bad request" });
            }

            const filePath = req.file.path;
            const mimetype = req.file.mimetype;

            const data = await projectsService.updatePicture(userId, id, filePath, mimetype);

            res.status(201).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating project picture -> ${e}` });
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

            const data = await projectsService.deletePicture(id, userId);

            res.status(200).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating project picture -> ${e}` });
        }
    }

    async delete(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            const optUserId = Number(userId);

            const data = await projectsService.delete(Number(id), optUserId);

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error deleteing project -> ${e}`,
            });
        }
    }

    async updateData(req: IAuthRequest, res: Response) {
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
            
            const { name } = req.body as { name: string };
            const filePath = req.file?.path;
            const mimetype = req.file?.mimetype;

            const data = await projectsService.updateData(
                id,
                name,
                filePath,
                mimetype,
                userId
            );

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error updating project data -> ${e}`,
            });
        }
    }
}

export default new ProjectsController();

