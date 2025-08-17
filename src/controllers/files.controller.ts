import { Request, Response } from "express";
import { IAuthRequest } from "../types/types";
import filesService from "../services/files.service";
import fs from "fs";

class FilesController {
    async upload(req: IAuthRequest, res: Response) {
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

            const optUserId = Number(userId);
            const filePath = req.file.path;
            const mimetype = req.file.mimetype;
            const objectType = req.body.objectType;
            const objectId = req.body.objectId;

            if (!objectType || !objectId) {
                return res
                    .status(400)
                    .json({ error: "File must be linked to the object!" });
            }

            const data = await filesService.upload(
                optUserId,
                filePath,
                objectType,
                objectId,
                mimetype
            );

            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error uploading file -> ${e}`,
            });
        }
    }

    async getFile(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const data = await filesService.getFile(Number(id));

            res.set("Content-Type", data.mime_type);

            const fileStream = fs.createReadStream(data.url);

            fileStream.on("error", (err) => {
                console.error("Error resding file:", err);
                res.status(500).end();
            });

            fileStream.pipe(res);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error getting file -> ${e}`,
            });
        }
    }

    async deleteFile(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;

            await filesService.deleteFile(Number(id), Number(req.userId));

            res.json({ message: 'success' });
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error deleting file -> ${e}`,
            });
        }
    }
}

export default new FilesController();
