// export const authMiddleware = async (
//     req: IAuthRequest,
//     res: Response,
//     next: NextFunction
// ) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         res.status(401).json({ message: "Unauthorized!" });
//         return;
//     }

//     const accessToken = authHeader && authHeader.split(" ")[1];

//     if (!accessToken) {
//         res.status(401).json({ message: "Unauthorized!" });
//         return;
//     }

//     try {
//         const user = await tokensService.validateAccessToken(accessToken);
//         const userId = req.signedCookies["userId"];
//         req.user = user;
//         req.userId = userId;
//         next();
//     } catch (err) {
//         return res.sendStatus(403);
//     }
// };

// export const socketAuthMiddleware = async (
//     socket: Socket,
//     next: (err?: Error) => void
// ) => {
//     try {
//         const token =
//             socket.handshake.auth.token ||
//             extractTokenFromCookie(socket.handshake.headers.cookie);

//         if (!token) {
//             return next(new Error("Authentication error: No token provided"));
//         }

//         const user = await tokensService.validateAccessToken(token);
//         if (typeof user === "string" || !user.id) {
//             return next(
//                 new Error("Authentication error: Invalid token structure")
//             );
//         }
//         (socket as IAuthenticatedSocket).userId = user.id;

//         next();
//     } catch (error) {
//         next(new Error("Authentication error: Invalid token"));
//     }
// };

import passport from 'passport';
import { verifyToken } from '../utils/jwt';
import { Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { IAuthenticatedSocket, IAuthRequest } from '../types/types';
import { Socket } from 'socket.io';

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

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
        return res
            .status(401)
            .json({ message: "Unauthorized!" });
    }

    try {
        const payload = verifyToken(accessToken, 'access');
    
        const result = await userService.getOne(String(payload.userId));
    
        if (result.data === null) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        req.user = result.data;
        req.userId = String(payload.userId);
        next();
    } catch (err) {
        return res
            .status(403)
            .json({ message: "Forbidden: Invalid token" });
    }
};

export const socketAuthMiddleware = async (
    socket: Socket,
    next: (err?: Error) => void
) => {
     try {
        const token =
            socket.handshake.auth.token ||
            extractTokenFromCookie(socket.handshake.headers.cookie) ||
            extractTokenFromAuthHeader(socket.handshake.headers.authorization);

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        const payload = verifyToken(token, 'access');
        const result = await userService.getOne(String(payload.userId));

        if (result.data === null) {
            return next(new Error("Authentication error: User not found"));
        }

        (socket as IAuthenticatedSocket).userId = String(payload.userId);

        next();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Token expired')) {
            return next(new Error("Authentication error: Token expired"));
        }
        if (error instanceof Error && error.message.includes('Invalid token')) {
            return next(new Error("Authentication error: Invalid token"));
        }
        next(new Error("Authentication error: Invalid token"));
    }
};

const extractTokenFromCookie = (cookieHeader?: string): string | null => {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        
        if (name === "refreshToken" && value) {
            return value;
        }
    }
    return null;
};

const extractTokenFromAuthHeader = (authHeader?: string): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};

export default passport;