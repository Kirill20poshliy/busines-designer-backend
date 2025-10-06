/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         desc:
 *           type: string
 *         content:
 *           type: string
 *         project_id:
 *           type: number
 *         project_name:
 *           type: string
 *         pict_url:
 *           type: string
 *         author_id:
 *           type: number
 *         author_name:
 *           type: string
 *         trigger_type:
 *           type: string
 *         category_id:
 *           type: string
 *         period:
 *           type: number
 *         last_run_date:
 *           type: string
 *         next_run_date:
 *           type: string
 *         is_running:
 *           type: boolean
 *         is_started:
 *           type: boolean
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string      
 */
export interface IDocument {
    id: string;
    name: string;
    desc: string;
    content: string;
    project_id: number;
    project_name: string;
    pict_url: string | null;
    author_id: number;
    author_name: string;
    trigger_type: string;
    category_id: string;
    period: number;
    last_run_date: string;
    next_run_date:string;
    is_running: boolean;
    is_started: boolean;
    created_at: string;
    updated_at: string;
}