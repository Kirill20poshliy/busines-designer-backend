import { Request, Response } from "express";
import processCategoriesService from "../services/processCategories.service";
import { IAuthRequest } from "../types/types";

class ProcessCategoriesController {
    async create(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401)
                    .json({message: "Unauthorized"});
            }

            const { name } = req.body;

            if (!name) {
                return res.status(400)
                    .json({message: "Process \"name\" are required"});
            }

            const data = await processCategoriesService.create(name);

            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error creating process category -> ${e}`,
            });
        }
    }
    
    async getAll(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401)
                    .json({message: "Unauthorized"});
            }

            const data = await processCategoriesService.getAll();

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error getting process categories -> ${e}`,
            });
        }
    }

    async getOne(req: IAuthRequest, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401)
                    .json({message: "Unauthorized"});
            }

            const { id } = req.params;

            const data = await processCategoriesService.getOne(id);

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error getting process category -> ${e}`,
            });
        }
    }
}

export default new ProcessCategoriesController();