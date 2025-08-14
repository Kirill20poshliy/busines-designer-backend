import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface ITokens {
    accessToken: string,
    refreshToken: string,
}

export interface IAuthRequest extends Request {
    userId?: string;
    user?: string | JwtPayload
}

export interface IDatabaseSchema {
	name: string;
	create: string;
	drop: string;
}
