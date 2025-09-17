import { Response } from "express";
import { IAuthRequest } from "../types/types";
import triggerTypesService from "../services/triggerTypes.service";

class TriggerTypesController {
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
                    .json({message: "Trigger \"name\" are required"});
            }

            const data = await triggerTypesService.create(name);

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

            const data = await triggerTypesService.getAll();

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error getting trigger types -> ${e}`,
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

            const data = await triggerTypesService.getOne(id);

            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error getting trigger type -> ${e}`,
            });
        }
    }
}

export default new TriggerTypesController()