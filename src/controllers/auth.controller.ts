import { Request, Response } from "express";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import bcrypt from 'bcryptjs'
import { UserDto } from "../dtos/user.dto";


class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { email, password, firstname, lastname } = req.body;
    
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: "Login and password are required" });
            }

            const result = await authService.register(email, password, firstname, lastname)

            res.status(201).json(result);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error while registering user -> ${e}` });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
    
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: "Email and password are required" });
            }

            const data = await authService.login(email, password);

            res.cookie('refreshToken', data.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true, secure: true, sameSite: 'none'})
            res.cookie('userId', data.data.id, {httpOnly: true, signed: true, secure: true, sameSite: 'none'})
            res.status(200).json(data);
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error while logging in -> ${e}` });
        }
    }

    async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.cookies
            const refresh = await authService.refresh(refreshToken)

            res.cookie('refreshToken', refresh.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            res.status(200).json(refresh)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Refresh error -> ${e}` });    
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                throw new Error('Unauthorized!')
            }

            await authService.logout(refreshToken)

            res.clearCookie('refreshToken')
            res.clearCookie('userId')
            res.status(200).json('Выполнен выход')
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: `Error while logging out -> ${e}` });
        }
    }
}

export default new AuthController()
