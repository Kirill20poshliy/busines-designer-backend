import { Request, Response } from "express";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import bcrypt from "bcryptjs";
import { UserDto } from "../dtos/user.dto";
import tokensService from "../services/tokens.service";
import { JwtPayload, verifyToken } from "../utils/jwt";
import { getDeviceInfo } from "../utils/device";

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
                return res.status(409).json({
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
            const deviceInfo = getDeviceInfo(req);

            const tokens = await tokensService.generateAndSaveTokens(
                userDto.id,
                userDto.email,
                deviceInfo,
                req.ip
            );

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

            const deviceInfo = getDeviceInfo(req);

            const tokens = await tokensService.generateAndSaveTokens(
                userDto.id,
                userDto.email,
                deviceInfo,
                req.ip
            );

            //DEV
            // res.cookie("refreshToken", tokens.refreshToken, {
            //     maxAge: 30 * 24 * 60 * 60 * 1000,
            //     httpOnly: true,
            // });
            // res.cookie("userId", userDto.id, { httpOnly: true, signed: true });

            //PROD
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true, secure: true, sameSite: 'none'})
            res.cookie('userId', userDto.id, {httpOnly: true, signed: true, secure: true, sameSite: 'none'})

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

    async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return res
                    .status(400)
                    .json({ message: "Refresh token is required" });
            }

            let payload: JwtPayload;
            try {
                payload = verifyToken(refreshToken, "refresh");
            } catch (error) {
                console.log("Token verification failed:", error);
                // res.clearCookie("refreshToken");
                // res.clearCookie("userId");

                return res
                    .status(401)
                    .json({ message: "Invalid refresh token" });
            }

            const storedToken = await tokensService.findValidRefreshToken(
                refreshToken
            );

            if (!storedToken) {
                console.log("Token not found in DB or revoked/expired");
                // res.clearCookie("refreshToken");
                // res.clearCookie("userId");

                return res
                    .status(401)
                    .json({ message: "Invalid refresh token" });
            }

            const user = await userService.getOne(String(payload.userId));

            if (!user.data) {
                console.log("User not found for token:", payload.userId);
                await tokensService.revokeRefreshToken(refreshToken);

                // res.clearCookie("refreshToken");
                // res.clearCookie("userId");

                return res.status(404).json({ message: "User not found" });
            }

            const tokens = await tokensService.refreshTokens(
                refreshToken,
                String(payload.userId),
                payload.email,
                getDeviceInfo(req),
                req.ip
            );

            res.cookie("refreshToken", tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });

            res.cookie("userId", payload.userId, {
                httpOnly: true,
                signed: true,
                secure: true,
                sameSite: "none",
            });

            res.status(200).json({
                accessToken: tokens.accessToken,
                data: {
                    ...user.data,
                },
            });
        } catch (e) {
            console.log("Refresh error:", e);

            // res.clearCookie("refreshToken");
            // res.clearCookie("userId");

            res.status(500).json({ message: `Refresh error -> ${e}` });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                throw new Error("Unauthorized!");
            }

            await tokensService.revokeRefreshToken(refreshToken);

            res.clearCookie("refreshToken");

            res.clearCookie("userId");

            res.json({ message: "Logged out successfully" });
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: `Error while logging out -> ${e}`,
            });
        }
    }
}

export default new AuthController();
