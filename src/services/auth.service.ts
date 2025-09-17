import { ITokens } from "../types/types";
import { UserDto } from "../dtos/user.dto";
import userService from "./user.service";
import bcrypt from "bcryptjs";
import tokensService from "./tokens.service";
import { IUser, IUserDto } from "../models/user.model";

class AuthService {
    // async register(
    //     email: string,
    //     password: string,
    //     firstname?: string,
    //     lastname?: string
    // ): Promise<ITokens & { data: IUserDto }> {
    //     const candidate = await userService.getOneByEmail(email);

    //     if (candidate.data !== null) {
    //         throw new Error("User already exists!");
    //     }

    //     const hashPass = await bcrypt.hash(password, 3);

    //     const user = await userService.create(
    //         email,
    //         hashPass,
    //         firstname,
    //         lastname
    //     );

    //     const userDto = new UserDto(user.id, user.email);

    //     const tokens = tokensService.generateTokens({ ...userDto });
    //     await tokensService.saveToken(userDto.id, tokens.refreshToken);

    //     return {
    //         ...tokens,
    //         data: userDto,
    //     };
    // }

    // async login(
    //     email: string,
    //     password: string
    // ): Promise<ITokens & { data: IUserDto }> {
    //     const candidate = await userService.getOneByEmail(email);

    //     if (!candidate || candidate?.data === null) {
    //         throw new Error(`User with email ${email} does not exist!`);
    //     }

    //     const passEqual = await bcrypt.compare(
    //         password,
    //         candidate.data.password
    //     );

    //     if (!passEqual) {
    //         throw new Error(`Invalid password!`);
    //     }

    //     const userDto = new UserDto(candidate.data.id, candidate.data.email);

    //     const tokens = tokensService.generateTokens({ ...userDto });

    //     await tokensService.saveToken(userDto.id, tokens.refreshToken);

    //     return {
    //         ...tokens,
    //         data: userDto,
    //     };
    // }

    // async logout(refreshToken: string): Promise<{ message: string }> {
    //     const token = await tokensService.removeToken(refreshToken);
    //     if (!token) {
    //         throw new Error("Internal server error");
    //     }
    //     return token;
    // }

    // async refresh(
    //     refreshToken: string
    // ): Promise<
    //     ITokens & {
    //         data: Omit<IUser, "created_at" | "updated_at" | "password">;
    //     }
    // > {
    //     const tokenDB = await tokensService.findToken(refreshToken);
    //     const validate = await tokensService.validateRefreshToken(refreshToken);

    //     if (!validate || !tokenDB) {
    //         throw new Error("Ошибка токенов!");
    //     }

    //     const id = tokenDB.user_id;
    //     const user = await userService.getOne(id);

    //     if (!user || user.data === null) {
    //         throw new Error(
    //             `Пользователя с id: ${tokenDB.user_id} не существует!`
    //         );
    //     }

    //     const userDto = new UserDto(user.data?.id, user.data.email);
    //     const tokens = tokensService.generateTokens({ ...userDto });

    //     await tokensService.saveToken(userDto.id, tokens.refreshToken);
    //     return {
    //         ...tokens,
    //         data: {
    //             ...userDto,
    //             firstname: user.data.firstname,
    //             lastname: user.data.lastname,
    //             name: user.data.name,
    //             pict_url: user.data.pict_url,
    //         },
    //     };
    // }
}

export default new AuthService();
