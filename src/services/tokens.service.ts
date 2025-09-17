// import { pool } from "../db";
// import { IToken } from "../models/token.model";
// import { IAuthRequest, ITokens } from "../types/types";
// import jwt from "jsonwebtoken";

// class TokensService {
//     accessTokenKey: string;
//     refreshTokenKey: string;

//     constructor() {
//         this.accessTokenKey =
//             process.env.JWT_ACCESSTOKEN_KEY || "jwt-accesstoken-key";
//         this.refreshTokenKey =
//             process.env.JWT_REFRESHTOKEN_KEY || "jwt-refreshtoken-key";
//     }

//     generateTokens(payload: object): ITokens {
//         const accessToken = jwt.sign(payload, this.accessTokenKey, {
//             expiresIn: "30m",
//         });
//         const refreshToken = jwt.sign(payload, this.refreshTokenKey, {
//             expiresIn: "30d",
//         });
//         return {
//             accessToken,
//             refreshToken,
//         };
//     }

//     async findToken(refreshToken: string): Promise<IToken> {
//         const token = await pool.query<IToken>(
//             `
//             SELECT *
//             FROM tokens
//             WHERE token = $1
//             LIMIT 1;`,
//             [refreshToken]
//         );

//         if (!token) {
//             throw new Error("Токена не существует.");
//         }

//         return token.rows[0];
//     }

//     async saveToken(
//         userId: string,
//         refreshToken: string
//     ): Promise<{ token: string }> {
//         const isExist = await pool.query<IToken>(
//             `
//             SELECT *
//             FROM tokens
//             WHERE user_id = $1`,
//             [userId]
//         );

//         if (isExist.rows.length !== 0) {
//             const newToken = await pool.query<IToken>(
//                 `
//                 UPDATE tokens
//                 SET token = $1
//                 WHERE user_id = $2`,
//                 [refreshToken, userId]
//             );

//             if (!newToken) {
//                 throw new Error("Internal server error.");
//             }

//             return newToken.rows[0];
//         } else {
//             const newToken = await pool.query<IToken>(
//                 `
//                 INSERT INTO tokens (
//                     token,
//                     user_id                
//                 )
//                 VALUES (
//                     $1,
//                     $2
//                 )
//                 RETURNING token`,
//                 [refreshToken, userId]
//             );

//             if (!newToken) throw new Error("Internal server error.");

//             return newToken.rows[0];
//         }
//     }

//     async removeToken(refreshToken: string): Promise<{ message: string }> {
//         const remove = await pool.query<IToken>(
//             `
//             DELETE 
//             FROM tokens 
//             WHERE token = $1`,
//             [refreshToken]
//         );

//         if (!remove) {
//             throw new Error("Error deleting token");
//         }

//         return { message: "success" };
//     }

//     async validateRefreshToken(
//         refreshToken: string
//     ): Promise<string | jwt.JwtPayload> {
//         const isValid = jwt.verify(refreshToken, this.refreshTokenKey);
//         if (!isValid) {
//             throw new Error("Invalid token");
//         }
//         return isValid;
//     }

//     async validateAccessToken(
//         accessToken: string
//     ): Promise<string | jwt.JwtPayload> {
//         const isValid = jwt.verify(accessToken, this.accessTokenKey);
//         if (!isValid) {
//             throw new Error("Invalid token");
//         }
//         return isValid;
//     }
// }

// export default new TokensService();

import { pool } from '../db';
import { generateTokens, verifyToken, JwtPayload } from '../utils/jwt';

class TokensService {
    async saveRefreshToken(
        userId: string, 
        token: string, 
        deviceInfo?: string, 
        ipAddress?: string
    ): Promise<void> {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
        await pool.query(`
            INSERT 
                INTO tokens (
                    user_id, 
                    token, 
                    device_info, 
                    ip_address, 
                    expires_at
                )
                VALUES ($1, $2, $3, $4, $5)`,
            [
                userId, 
                token, 
                deviceInfo, 
                ipAddress, 
                expiresAt
            ]
        );
    }

    async findValidRefreshToken(token: string): Promise<{
        id: number;
        user_id: number;
        revoked: boolean;
        expires_at: Date;
    } | null> {
        const result = await pool.query(`
            SELECT 
                id, 
                user_id,
                revoked, 
                expires_at 
            FROM tokens 
            WHERE token = $1 
                AND revoked = false 
                AND expires_at > NOW()`,
            [token]
        );

        return result.rows[0] || null;
    }

    async revokeRefreshToken(token: string): Promise<void> {
        await pool.query(`
            UPDATE tokens 
            SET revoked = true 
            WHERE token = $1`,
            [token]
        );
    }

    async revokeAllUserTokens(userId: number): Promise<void> {
        await pool.query(`
            UPDATE tokens 
            SET revoked = true 
            WHERE user_id = $1`,
            [userId]
        );
    }

    async cleanupExpiredTokens(): Promise<void> {
        await pool.query(`
            DELETE FROM tokens 
            WHERE expires_at < NOW() 
                OR revoked = true`
        );
    }

    async generateAndSaveTokens(
        userId: string, 
        email: string,
        deviceInfo?: string,
        ipAddress?: string
    ) {
        const tokens = generateTokens(userId, email);
        await this.saveRefreshToken(userId, tokens.refreshToken, deviceInfo, ipAddress);
        return tokens;
    }
}

export default new TokensService()