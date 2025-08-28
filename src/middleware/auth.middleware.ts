import { Response, NextFunction } from "express";
import tokensService from "../services/tokens.service";
import { IAuthRequest } from "../types/types";

export const authMiddleware = async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: "Unauthorized!" });
        return;
    }

    const accessToken = authHeader && authHeader.split(" ")[1];

    if (!accessToken) {
        res.status(401).json({ message: "Unauthorized!" });
        return;
    }

    try {
        const user = await tokensService.validateAccessToken(accessToken);
        const userId = req.signedCookies["userId"];
        req.user = user;
        req.userId = userId;
        next();
    } catch (err) {
        return res.sendStatus(403);
    }
};
