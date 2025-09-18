import { pool } from '../db';
import { generateTokens } from '../utils/jwt';

class TokensService {
    async saveRefreshToken(
        userId: string, 
        token: string, 
        deviceInfo?: string, 
        ipAddress?: string
    ): Promise<void> {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
        await pool.query(`
            INSERT INTO tokens (
                user_id, 
                token, 
                device_info, 
                ip_address, 
                expires_at
            )
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (token) 
            DO UPDATE SET 
                revoked = false,
                expires_at = $5,
                updated_at = NOW()`,
            [
                parseInt(userId),
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
            SET revoked = true,
                updated_at = NOW()
            WHERE token = $1`,
            [token]
        );
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await pool.query(`
            UPDATE tokens 
            SET revoked = true,
                updated_at = NOW()
            WHERE user_id = $1`,
            [parseInt(userId)]
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

    async refreshTokens(
        oldToken: string,
        userId: string,
        email: string,
        deviceInfo?: string,
        ipAddress?: string
    ) {
        await this.revokeRefreshToken(oldToken);
        
        const tokens = generateTokens(userId, email);
        await this.saveRefreshToken(userId, tokens.refreshToken, deviceInfo, ipAddress);
        
        return tokens;
    }
}

export default new TokensService()