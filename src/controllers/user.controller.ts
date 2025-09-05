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

    async getProfile(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const data = await userService.getOne(userId)

            res.status(200).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error getting current user profile -> ${e}` });
        }
    }

    async updateEmail(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const body = req.body as {email: string};
            const data = await userService.updateEmail(userId, body);

            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Error updating user email -> ${e}` });
        }
    }

    async updatePassword(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const body = req.body;
            const data = await userService.updatePassword(userId, body);

            res.status(201).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user password -> ${e}` });
        }
    }

    async updateFirstname(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const { firstname } = req.body;
            const data = await userService.updateFirstname(userId, firstname);

            res.status(201).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user firstname -> ${e}` });
        }
    }

    async updateLastname(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }
            
            const { lastname } = req.body;
            const data = await userService.updateLastname(userId, lastname);

            res.status(201).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user lastname -> ${e}` });
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
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const filePath = req.file.path;
            const mimetype = req.file.mimetype;

            const data = await userService.updateAvatar(userId, filePath, mimetype);

            res.status(201).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user avatar -> ${e}` });
        }
    }

    async deleteAvatar(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }

            const data = await userService.deleteAvatar(userId);

            res.status(200).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error deleting user avatar -> ${e}` });
        }
    }

    async updateProfile(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res
                    .status(403)
                    .json({ message: "Current user ID are required" });
            }
            
            const { firstname, lastname, email } = req.body;
            const data = await userService.updateProfile(userId, firstname, lastname, email);

            res.status(201).json(data)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error updating user profile -> ${e}` });
        }
    }
}

export default new UserController()