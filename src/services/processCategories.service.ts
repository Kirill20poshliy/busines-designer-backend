import { Request, Response } from "express";
import { pool } from "../db";
import { IProcessCategory } from "../models/processCategory.model";

class ProcessCategoriesService {
    async create(name: string): Promise<{data: IProcessCategory}> {
        if (!name) {
            throw new Error('Process \"name\" are required!');
        }

        const data = await pool.query<IProcessCategory>(`
            INSERT
            INTO process_categories (name)
            VALUES ($1)`,
            [name]
        )

        return {
            data: data.rows[0]
        }
    }
    
    async getAll(): Promise<{data: IProcessCategory[]}> {
        const result = await pool.query<IProcessCategory>(`
            SELECT *
            FROM process_categories`
        )

        return {
            data: result.rows ?? []
        }
    }

    async getOne(id: string): Promise<{data: IProcessCategory | null}> {
        const result = await pool.query<IProcessCategory>(`
            SELECT *
            FROM process_categories
            WHERE id = $1`,
            [id]
        )

        return {
            data: result.rows[0] ?? null
        }
    }
}

export default new ProcessCategoriesService();