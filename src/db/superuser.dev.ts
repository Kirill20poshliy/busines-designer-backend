import bcrypt from "bcryptjs";
import { pool } from ".";
import { IUser } from "../models/user.model";

export const createSuperuserFunc = async () => {
    const email = "user1@example.com";
    const password = "user1";

    console.log("Starting...\n");
    const client = await pool.connect();

    try {
        const hashPass = await bcrypt.hash(password, 3);

        const candidate = await client.query<{ id: number }>(
            `
            SELECT id
            FROM users
            WHERE email = $1
            LIMIT 1`,
            [email]
        );

        if (candidate.rows.length > 0) {
            throw new Error(`User with email "${email}" already exists`);
        }

        const superuser = await client.query<IUser>(
            `
            INSERT INTO users (
                firstname,
                lastname,
                name,
                email,
                password
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            );`,
            ["Иван", "Иванов", "Иванов Иван", email, hashPass]
        );

        if (!superuser) {
            throw new Error("Error while creating superuser");
        }

        console.log(
            `✔️  Superuser created!\n\n   ◽Email: ${email}\n   ◽Password: ${password}\n`
        );
    } catch (e) {
        console.log(`❌ Superuser creation error -> ${e}.\n`);
    } finally {
        client.release();
    }
};