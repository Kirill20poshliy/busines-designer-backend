import "dotenv/config"
import { promises as fs } from "fs";
import path from "path";
import { pool } from "./index";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

const runMigrations = async () => {
	console.log('Starting migration...\n')
    const client = await pool.connect();
    
    try {
        await client.query(`
			CREATE TABLE IF NOT EXISTS migrations (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				executed_at TIMESTAMP DEFAULT NOW()
			)
		`);

        const { rows: executedMigrations } = await client.query<{
            name: string;
        }>("SELECT name FROM migrations ORDER BY name");

        const executedNames = new Set(executedMigrations.map((m) => m.name));
        const migrationFiles = (await fs.readdir(MIGRATIONS_DIR))
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const file of migrationFiles) {
            if (!executedNames.has(file)) {
                console.log(`⏳ Running migration: ${file}`);

                const migrationPath = path.join(MIGRATIONS_DIR, file);
                const migrationSQL = await fs.readFile(migrationPath, "utf-8");

                await client.query("BEGIN");
                try {
                    await client.query(migrationSQL);
                    await client.query(
                        "INSERT INTO migrations (name) VALUES ($1)",
                        [file]
                    );
                    await client.query("COMMIT");
                    console.log(`\n✔️  Migration ${file} completed!`);
                } catch (err) {
                    await client.query("ROLLBACK");
					console.log('\n❌ Migration error.')
                    throw err;
                }
            }
        }
    } finally {
        client.release();
    }
}

runMigrations()
    .then(() => {
        console.log("\n🎉🎉🎉 Migrations completed!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("⛔ Migrations failed:", err);
        process.exit(1);
    });
