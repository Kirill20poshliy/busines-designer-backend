import { Request, Response } from "express"
import userService from "../services/user.service"

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
            const data = await userService.getOne(Number(id))

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
}

export default new UserController()