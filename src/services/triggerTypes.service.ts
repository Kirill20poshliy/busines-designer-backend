import { pool } from "../db";
import { ITriggerType } from "../models/triggerType.model";

class TriggerTypesService {
    async create(name: string): Promise<{data: ITriggerType}> {
        if (!name) {
            throw new Error('Trigger \"name\" are required!');
        }

        const data = await pool.query<ITriggerType>(`
            INSERT
            INTO trigger_types (name)
            VALUES ($1)`,
            [name]
        )

        return {
            data: data.rows[0]
        }
    }
    
    async getAll(): Promise<{data: ITriggerType[]}> {
        const result = await pool.query<ITriggerType>(`
            SELECT *
            FROM trigger_types`
        )

        return {
            data: result.rows ?? []
        }
    }

    async getOne(id: string): Promise<{data: ITriggerType | null}> {
        const result = await pool.query<ITriggerType>(`
            SELECT *
            FROM trigger_types
            WHERE id = $1`,
            [id]
        )

        return {
            data: result.rows[0] ?? null
        }
    }
}

export default new TriggerTypesService();