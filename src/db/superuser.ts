import "dotenv/config";
import { Command } from 'commander';
import { pool } from ".";
import { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";

const program = new Command();

program
  .requiredOption('-e, --email <email>', 'Admin email')
  .requiredOption('-p, --password <password>', 'Admin password')
  .parse(process.argv);

const createSuperuser = async () => {
    const { email, password } = program.opts();

    console.log('Starting...\n')
    const client = await pool.connect()

    try {
        const hashPass = await bcrypt.hash(password, 3);

        const candidate = await client.query<{id: number}>(`
            SELECT id
            FROM users
            WHERE email = $1
            LIMIT 1`,
            [email]
        )

        if (candidate.rows.length > 0) {
            throw new Error(`User with email "${email}" already exists`)
        }

        const superuser = await client.query<IUser>(`
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
            [
                'Иван', 
                'Иванов', 
                'Иванов Иван', 
                email, 
                hashPass
            ]
        )

        if (!superuser) {
            throw new Error('Error while creating superuser')
        }

        console.log(`✔️  Superuser created!\n\n   ◽Email: ${email}\n   ◽Password: ${password}\n`)
    } catch (e) {
        console.log(`❌ Superuser creation error -> ${e}.\n`)
    } finally {
        client.release();
    }
}

createSuperuser()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error("⛔ Superuser creation failed:", err);
        process.exit(1);
    })