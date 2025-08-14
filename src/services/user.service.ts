import { pool } from "../db";
import { IUser, IUserInfo } from "../models/user.model";
import bcrypt from "bcryptjs"

class UserService {
    async create(email: string, password: string): Promise<IUserInfo> {
        const client = await pool.connect();
        const data = await client.query<IUserInfo>(
            `
            INSERT INTO users (
                email, 
                password
            ) VALUES ($1, $2)
            RETURNING id, email, created_at`,
            [email, password]
        );

        if (!data) {
            throw new Error("Error while creating user.");
        }

        return data.rows[0];
    }

    async getAll(): Promise<{data: IUserInfo[]}> {
        const client = await pool.connect();
        const data = await client.query<IUserInfo>(`
            SELECT 
                id,
                email,
                created_at
            FROM users`);

        if (!data) {
            throw new Error("Error while getting users.");
        }

        return {data: data.rows};
    }

    async getOne(id: number): Promise<{data: IUserInfo}> {
        const client = await pool.connect();
        const data = await client.query<IUserInfo>(
            `
            SELECT
                id,
                email,
                created_at
            FROM users
            WHERE id = $1
            LIMIT 1;`,
            [id]
        );

        if (!data) {
            throw new Error(`Error while getting user "${id}".`);
        }

        return {data: data.rows[0] || null};
    }

    async getOneByEmail(email: string): Promise<{data: IUser}> {
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

        return {data: data.rows[0] || null};
    }

    async updateEmail(
        id: number,
        body: { email: string }
    ): Promise<{ message: string }> {
        if (!body.email) {
            throw new Error("Email не задан.");
        }
        const client = await pool.connect();
        const data = await client.query(
            `
            UPDATE users
            SET email = $1, updated_at = NOW()
            WHERE id = $2;`,
            [body.email, id]
        );

        if (!data) {
            throw new Error(`Error while user "${id}" email updating.`);
        }

        return { message: "success" };
    }

    async updatePassword(
        id: number,
        body: { password: string }
    ): Promise<{ message: string }> {
        if (!body.password) {
            throw new Error("Password are required!.");
        }

        const hashPass = await bcrypt.hash(body.password, 3)

        const client = await pool.connect();
        const data = await client.query(
            `
            UPDATE users
            SET password = $1, updated_at = NOW()
            WHERE id = $2;`,
            [hashPass, id]
        );

        if (!data) {
            throw new Error(`Error while user "${id}" passeord updating.`);
        }

        return { message: "success" };
    }

    async delete(id: number): Promise<{ message: string }> {
        const client = await pool.connect();
        const data = await client.query(`
            DELETE 
            FROM users 
            WHERE id = $1`,
            [id]
        )

        if (!data) {
            throw new Error(`Error while user "${id}" deleteing.`)
        }

        return { message: "success" };
    }
}

export default new UserService();
