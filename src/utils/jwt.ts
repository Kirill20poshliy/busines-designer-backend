import jwt, { SignOptions, JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import { StringValue } from 'ms';

const JWT_SECRET = process.env.JWT_SECRET || 'result-secret';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '30m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JwtPayload extends BaseJwtPayload {
    userId: number;
    email: string;
    type: 'access' | 'refresh';
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
}

export const generateTokens = (userId: string, email: string): Tokens => {
    const accessOptions: SignOptions = {
        expiresIn: JWT_ACCESS_EXPIRES_IN as StringValue | number
    };

    const refreshOptions: SignOptions = {
        expiresIn: JWT_REFRESH_EXPIRES_IN as StringValue | number
    };

    const accessToken = jwt.sign(
        { userId, email, type: 'access' } as object,
        JWT_SECRET,
        accessOptions
    );

    const refreshToken = jwt.sign(
        { userId, email, type: 'refresh' } as object,
        JWT_SECRET,
        refreshOptions
    );

    const decoded = jwt.decode(accessToken);
    let accessTokenExpires: number;

    if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
        accessTokenExpires = (decoded as { exp: number }).exp * 1000;
    } else {
        accessTokenExpires = Date.now() + 15 * 60 * 1000;
    }

    return { accessToken, refreshToken, accessTokenExpires };
};

export const verifyToken = (token: string, expectedType?: 'access' | 'refresh'): JwtPayload => {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
        if (expectedType && payload.type !== expectedType) {
            throw new Error(`Invalid token type: expected ${expectedType}, got ${payload.type}`);
        }
    
        return payload;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }

        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }

        throw new Error('Token verification failed');
    }
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwt.decode(token);
    
        if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
            const exp = (decoded as { exp: number }).exp;
            const currentTime = Math.floor(Date.now() / 1000);
            return exp < currentTime;
        }
    
        return true;
    } catch {
        return true;
    }
};

export const getTokenExpiration = (token: string): Date | null => {
    try {
        const decoded = jwt.decode(token);
    
        if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
            const expTimestamp = (decoded as { exp: number }).exp * 1000;
            return new Date(expTimestamp);
        }
    
        return null;
    } catch {
        return null;
    }
};

export const isTokenExpiringSoon = (token: string, thresholdMinutes: number = 5): boolean => {
    try {
        const decoded = jwt.decode(token);
    
        if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
            const exp = (decoded as { exp: number }).exp;
            const currentTime = Math.floor(Date.now() / 1000);
            const thresholdSeconds = thresholdMinutes * 60;

            return exp - currentTime < thresholdSeconds;
        }
    
        return false;
    } catch {
        return false;
    }
};