import { Request, Response } from "express";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import bcrypt from "bcryptjs";
import { UserDto } from "../dtos/user.dto";
import tokensService from "../services/tokens.service";

class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { email, password, firstname, lastname } = req.body;

            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: "Login and password are required" });
            }

            const candidate = await userService.getOneByEmail(email);

            if (candidate && candidate.data) {
                return res
                    .status(409)
                    .json({
                        message: `User with email ${email} already exists!`,
                    });
            }

            const hashPass = await bcrypt.hash(password, 3);

            const newUser = await userService.create(
                email,
                hashPass,
                firstname,
                lastname
            );

            const userDto = new UserDto(newUser.id, newUser.email);

            const tokens = tokensService.generateTokens({ ...userDto });
            await tokensService.saveToken(userDto.id, tokens.refreshToken);

            res.status(201).json({
                accessToken: tokens.accessToken,
                data: {
                    ...userDto,
                    firstname: newUser.firstname ?? "",
                    lastname: newUser.lastname ?? "",
                    name: newUser.name ?? "",
                    pict_url: newUser.pict_url ?? "",
                },
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error while registering user -> ${e}`,
            });
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

            const candidate = await userService.getOneByEmail(email);

            if (!candidate || !candidate?.data) {
                return res
                    .status(404)
                    .json({ message: `User with email ${email} not found!` });
            }

            const passEqual = await bcrypt.compare(
                password,
                candidate.data.password
            );

            if (!passEqual) {
                return res.status(400).json({ message: "Invalid password" });
            }

            const userDto = new UserDto(
                candidate.data.id,
                candidate.data.email
            );

            const tokens = tokensService.generateTokens({ ...userDto });

            await tokensService.saveToken(userDto.id, tokens.refreshToken);

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            res.cookie('userId', userDto.id, {httpOnly: true, signed: true})
            // res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true, secure: true, sameSite: 'none'})
            // res.cookie('userId', userDto.id, {httpOnly: true, signed: true, secure: true, sameSite: 'none'})

            res.status(200).json({
                accessToken: tokens.accessToken,
                data: {
                    ...userDto,
                    firstname: candidate.data.firstname ?? "",
                    lastname: candidate.data.lastname ?? "",
                    name: candidate.data.name ?? "",
                    pict_url: candidate.data.pict_url ?? "",
                },
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Error while logging in -> ${e}` });
        }
    }

    async authCheck(req: Request, res: Response) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                res.status(401).json({
                    message: "Unauthorized",
                });
                return;
            }

            const valid = tokensService.validateRefreshToken(refreshToken);

            const userId = req.signedCookies["userId"];

            if (!userId || !valid) {
                res.status(401).json({
                    message: "Invalid user data",
                });
                return;
            }

            const tokenExists = await tokensService.findToken(refreshToken);

            if (!tokenExists) {
                res.status(401).json({
                    message: "Invalid token",
                });
                return;
            }

            const userProfile = await userService.getOne(userId);

            if (!userProfile.data) {
                res.status(404).json({
                    message: `User ${userId} not found`,
                });
                return;
            }

            const accessToken = tokensService.generateTokens({
                id: userProfile.data.id,
                email: userProfile.data.email,
            }).accessToken;

            res.status(200).json({
                accessToken,
                data: {
                    id: userProfile.data.id,
                    email: userProfile.data.email,
                    firstname: userProfile.data.firstname,
                    lastname: userProfile.data.lastname,
                    name: userProfile.data.name,
                    pict_url: userProfile.data.pict_url,
                },
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Auth check error -> ${e}` });
        }
    }

    async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.cookies;
            const refresh = await authService.refresh(refreshToken);

            res.cookie("refreshToken", refresh.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true, secure: true, sameSite: 'none'
            });
            res.status(200).json({
                accessToken: refresh.accessToken,
                data: {
                    ...refresh.data,
                },
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: `Refresh error -> ${e}` });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                throw new Error("Unauthorized!");
            }

            await authService.logout(refreshToken);

            res.clearCookie("refreshToken");
            res.clearCookie("userId");
            res.status(200).json("Выполнен выход");
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error while logging out -> ${e}`,
            });
        }
    }
}

export default new AuthController();
