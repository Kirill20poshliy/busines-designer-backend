import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";

export interface ITokens {
    accessToken: string;
    refreshToken: string;
}

export interface IAuthRequest extends Request {
    userId?: string;
    user?: string | JwtPayload;
}

export interface IAuthenticatedSocket extends Socket {
    userId: string;
    username: string;
    joinedDocuments: Set<string>;
}

export interface IDatabaseSchema {
    name: string;
    create: string;
    drop: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: number
 *         limit:
 *           type: number
 *         total:
 *           type: number
 *         total_pages:
 *           type: number
 *         prev:
 *           type: string
 *         next:
 *           type: string
 *
 */
export interface IPagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    prev: string | null;
    next: string | null;
}

export interface IEdge {
    id: string;
    source: string;
    target: string;
}

export interface INode {
    id: string;
    data: {
        label: string;
        url?: string;
        body?: unknown;
        abortStatus?: number;
        continueStatus?: number;
        to?: string;
        text?: string;
		prev_success?: boolean;
		prev_error?: boolean;
        value?: number;
		type?: string;
    };
    type: string;
}
