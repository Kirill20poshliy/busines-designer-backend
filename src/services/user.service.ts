import { pool } from "../db";
import { IUser, IUserInfo } from "../models/user.model";
import bcrypt from "bcryptjs";
import filesService from "./files.service";

class UserService {
    async create(
        email: string,
        password: string,
        firstname?: string,
        lastname?: string
    ): Promise<IUserInfo> {
        const client = await pool.connect();
        const data = await client.query<IUserInfo>(
            `
            INSERT INTO users (
                email, 
                password,
                firstname,
                lastname,
                name,
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, created_at`,
            [
                email,
                password,
                firstname ?? null,
                lastname ?? null,
                firstname || lastname ? [lastname, firstname].join(" ") : null,
            ]
        );

        if (!data.rows.length) {
            throw new Error("Error while creating user.");
        }

        return data.rows[0];
    }

    async getAll(): Promise<{ data: IUserInfo[] }> {
        const client = await pool.connect();
        const data = await client.query<IUserInfo>(`
            SELECT 
                id,
                email,
                firstname,
                lastname,
                name,
                pict_url,
                created_at
            FROM users`);

        if (!data) {
            throw new Error("Error while getting users.");
        }

        return { data: data.rows };
    }

    async getOne(id: string): Promise<{ data: IUserInfo }> {
        const client = await pool.connect();
        const data = await client.query<IUserInfo>(
            `
            SELECT
                id,
                email,
                firstname,
                lastname,
                name,
                pict_url,
                created_at
            FROM users
            WHERE id = $1
            LIMIT 1;`,
            [id]
        );

        if (!data) {
            throw new Error(`Error while getting user "${id}".`);
        }

        return { data: data.rows[0] || null };
    }

    async getOneByEmail(email: string): Promise<{ data: IUser }> {
        const client = await pool.connect();
        const data = await client.query<IUser>(
            `
            SELECT
                id,
                email,
                password,
                created_at
            FROM users
            WHERE email = $1
            LIMIT 1;`,
            [email]
        );

        if (!data) {
            throw new Error(`Error while getting user with email: "${email}".`);
        }

        return { data: data.rows[0] || null };
    }

    async updateEmail(
        id: string,
        body: { email: string }
    ): Promise<{ message: string }> {
        if (!body.email) {
            throw new Error("Email не задан.");
        }
        const client = await pool.connect();
        const data = await client.query(
            `
            UPDATE users
            SET 
                email = $1, 
                updated_at = NOW()
            WHERE id = $2;`,
            [body.email, id]
        );

        if (!data) {
            throw new Error(`Error while user "${id}" email updating.`);
        }

        return { message: "success" };
    }

    async updatePassword(
        id: string,
        body: { password: string; newPassword: string }
    ): Promise<{ message: string }> {
        if (!body.password) {
            throw new Error("Password are required!.");
        }

        const client = await pool.connect();

        const user = await client.query<{ password: string }>(
            `
            SELECT password
            FROM user
            WHERE id = $1
            LIMIT 1`,
            [id]
        );

        if (!user.rows.length) {
            throw new Error(`User with id "${id}" not found`);
        }

        const verifyPass = await bcrypt.compare(
            body.password,
            user.rows[0].password
        );

        if (!verifyPass) {
            throw new Error(`Invalid password`);
        }

        const hashPass = await bcrypt.hash(body.password, 3);

        const data = await client.query(
            `
            UPDATE users
            SET 
                password = $1, 
                updated_at = NOW()
            WHERE id = $2;`,
            [hashPass, id]
        );

        if (!data) {
            throw new Error(`Error while user "${id}" password updating.`);
        }

        return { message: "success" };
    }

    async updateFirstname(
        id: string,
        firstname: string
    ): Promise<{ message: string }> {
        const client = await pool.connect();

        const user = await this.getOne(id);

        if (!user) {
            throw new Error(`User with id: "${id}" doesn't exists.`);
        }

        const data = await client.query(
            `
            UPDATE users
            SET 
                firstname = $1, 
                name = $2, 
                updated_at = NOW()
            WHERE id = $3;`,
            [firstname, [user.data.lastname, firstname].join(" "), id]
        );

        if (!data) {
            throw new Error(`Error while user "${id}" firstname updating.`);
        }

        return { message: "success" };
    }

    async updateLastname(
        id: string,
        lastname: string
    ): Promise<{ message: string }> {
        const client = await pool.connect();

        const user = await this.getOne(id);

        if (!user) {
            throw new Error(`User with id: "${id}" doesn't exists.`);
        }

        const data = await client.query(
            `
            UPDATE users
            SET 
                lastname = $1, 
                name = $2, 
                updated_at = NOW()
            WHERE id = $3;`,
            [lastname, [lastname, user.data.firstname].join(" "), id]
        );

        if (!data) {
            throw new Error(`Error while user "${id}" lastname updating.`);
        }

        return { message: "success" };
    }

    async updateAvatar(
        userId: string,
        filePath: string,
        mimetype: string
    ): Promise<{ message: string }> {
        const fileData = await filesService.upload(
            userId,
            filePath,
            "user",
            userId,
            mimetype
        );

        if (!fileData) {
            throw new Error(`Unable to upload file.`);
        }

        const client = await pool.connect();

        const data = client.query(
            `
            UPDATE users
            SET 
                pict_url = $1,
                updated_at = NOW()
            WHERE id = $2`,
            [fileData.photoUrl, userId]
        );

        if (!data) {
            throw new Error(`Error while user "${userId}" avatar updating.`);
        }

        return { message: "success" };
    }

    async deleteAvatar(userId: string): Promise<{ message: string }> {
        const client = await pool.connect();

        const data = await client.query(
            `
            UPDATE users
            SET 
                pict_url = null,
                updated_at = NOW()
            WHERE id = $1`,
            [userId]
        );

        if (!data) {
            throw new Error(`Error while deleting user avatar`);
        }

        return { message: "success" };
    }

    async delete(id: number): Promise<{ message: string }> {
        const client = await pool.connect();
        const data = await client.query(
            `
            DELETE 
            FROM users 
            WHERE id = $1`,
            [id]
        );

        if (!data) {
            throw new Error(`Error while user "${id}" deleteing.`);
        }

        return { message: "success" };
    }

    async updateProfile(
        userId: string,
        firstname: string,
        lastname: string,
        email: string
    ): Promise<{ message: string }> {
        const client = await pool.connect();

        const user = await this.getOne(userId);

        if (!user) {
            throw new Error(`User with id: "${userId}" doesn't exists.`);
        }

        const data = await client.query(
            `
            UPDATE users
            SET 
                firstname = $1,
                lastname = $2,
                name = $3, 
                email = $4,
                updated_at = NOW()
            WHERE id = $5;`,
            [
                firstname,
                lastname,
                [lastname, firstname].join(" "),
                email,
                userId,
            ]
        );

        if (!data) {
            throw new Error(`Error while user "${userId}" profile updating.`);
        }

        return { message: "success" };
    }
}

export default new UserService();
