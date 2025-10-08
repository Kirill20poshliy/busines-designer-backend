import { IDocument } from '../models/document.model';

export class Agent {
    constructor(
        protected record: IDocument
    ) {}

    public get id(): string {
        return this.record.id;
    }

    public get name(): string {
        return this.record.name;
    }

    public get isStarted(): boolean {
        return this.record.is_started;
    }

    public get period(): number {
        return this.record.period;
    }

    public get content(): string {
        return this.record.content;
    }

    public get status() {
        return {
            id: this.record.id,
            name: this.record.name,
            isStarted: this.record.is_started,
            isRunning: this.record.is_running,
            period: this.record.period,
            lastExecution: this.record.last_run_date,
            nextExecution: this.record.next_run_date,
            content: this.record.content
        };
    }

    public updateRecord(record: IDocument): void {
        this.record = record;
    }

    public async processContent(content: string): Promise<{
        success: boolean, 
        error: string | undefined
    }> {
        if (content) {
            console.log('Agent processing...')
        }
        return {
            success: true,
            error: undefined
        }
    }
}