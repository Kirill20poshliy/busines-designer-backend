import { Request } from "express";

export const getDeviceInfo = (req: Request): string => {
    const userAgent = req.headers['user-agent'];
    return userAgent || 'Unknown device';
};

export const getClientIp = (req: Request): string => {
    return req.ip || 
           (req.socket && req.socket.remoteAddress) || 
           'Unknown IP';
};