import { Pool, PoolConfig } from 'pg';
import { schemas } from './schemas';
	
const dbConfig: PoolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
};
	
export const pool = new Pool(dbConfig);
	
export async function initializeDatabase() {
	console.log('Starting DB initialization...\n')
	const client = await pool.connect();

	try {
		console.log('Executing schemas:')
		for (const schema of schemas) {
			console.log(`◽ Initializing ${schema.name} table...`);
			await client.query(schema.create);
		}
		
		console.log('\n✨ All tables initialized successfully!\n');
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('⛔ Database initialization failed:', err);
		throw err;
	} finally {
		client.release();
	}
}
	
export async function dropDatabase() {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
	
		for (let i = schemas.length - 1; i >= 0; i--) {
			const schema = schemas[i];
			console.log(`Dropping ${schema.name} table...`);
			await client.query(schema.drop);
		}
	
		await client.query('COMMIT');
		console.log('All tables dropped successfully');
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('Database drop failed:', err);
		throw err;
	} finally {
		client.release();
	}
}
	
async function testConnection() {
	try {
		await pool.query('SELECT NOW()');
	} catch (err) {
		console.error('⛔ Database connection error', err);
		process.exit(1);
	}
}
	
testConnection();