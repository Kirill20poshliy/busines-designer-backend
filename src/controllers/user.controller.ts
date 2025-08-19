import { Request, Response } from "express"
import userService from "../services/user.service"
import { IAuthRequest } from "../types/types";

class UserController {

    async getAll(req: Request, res: Response) {
        try {
            const data = await userService.getAll();

            res.status(200).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error getting users -> ${e}` });
        }
    }
    
    async getOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = await userService.getOne(id)

            res.status(200).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error getting user by id -> ${e}` });
        }
    }

    async updateEmail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const body = req.body as {email: string};
            const data = await userService.updateEmail(Number(id), body);

            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Error updating user email -> ${e}` });
        }
    }

    async updatePassword(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const body = req.body;
            const data = await userService.updatePassword(Number(id), body);

            res.status(201).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user password -> ${e}` });
        }
    }

    async updateFirstname(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { firstname } = req.body;
            const data = await userService.updateFirstname(id, firstname);

            res.status(201).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user password -> ${e}` });
        }
    }

    async updateLastname(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { lastname } = req.body;
            const data = await userService.updateLastname(id, lastname);

            res.status(201).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user password -> ${e}` });
        }
    }

    async updateAvatar(req: IAuthRequest, res: Response) {
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

            const data = await userService.updateAvatar(optUserId, filePath, mimetype);

            res.status(201).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user avatar -> ${e}` });
        }
    }
}

export default new UserController()