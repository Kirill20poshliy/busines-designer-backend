import { IDocument } from '../models/document.model';
import apiQuery from '../utils/apiQuery';
import { convertMilliseconds } from '../utils/convertMilliseconds';
import { parseDocumentContent } from '../utils/parseDocumentContent';
import { sendAgentEmail } from '../utils/sendEmail';

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
        try {
            if(!content) {
                throw new Error('Агент не может быть пустым');
            }
            
            const nodesData = parseDocumentContent(content);

            for (let node of nodesData) {
                const nodeType = node.type
                const data = node.data

                switch (nodeType) {
                    case 'request':
                        const url = data.url;
                        if (!url) {
                            throw new Error('Обязательное поле "url" в запросе не заполнено!');
                        }

                        console.log(`Sending request to: "${url}"...`);

                        const body = data.body;

                        const result = body ? await apiQuery.post(url, body) : await apiQuery.get(url);

                        if (result.status == (data.continueStatus ?? 200)) {
                            break;
                        }
                        if (result.status == (data.abortStatus ?? 500)) {
                            throw new Error(`Запрос завершён со статусом: ${result.status}`);
                        }
                    case 'condition':
                        const email = data.to;
                        if (!email) {
                            throw new Error('Обязательное поле "email" в блоке "Письмо" не заполнено!');
                        }

                        console.log(`Sending email to: ${email}...`);

                        const message = data.text

                        const emailResult = await sendAgentEmail(email, message ?? '');

                        if (emailResult.success) {
                            break;
                        } else {
                            throw new Error(emailResult.error);
                        }
                    case 'middle-process':
                        const timer = Number(data.value);
                        if (!timer) {
                            break;
                        }

                        const timeType = data.type;

                        const delay = convertMilliseconds(timer, timeType)

                        console.log(`Waiting for ${delay/1000} sec...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        break;
                    default:
                        break;
                }
            }

            return {
                success: true,
                error: undefined
            }
        } catch (e) {
            return {
                success: false,
                error: (e as Error).message
            }            
        }
    }
}