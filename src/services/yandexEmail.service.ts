import nodemailer from 'nodemailer';
import 'dotenv';


export class YandexEmailService {
  private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 587,
            secure: false,
            tls: {
                servername: 'smtp.yandex.ru'
            },
            connectionTimeout: 10000,
            socketTimeout: 15000,
            auth: {
                user: process.env.YANDEX_EMAIL || 'qazasd2014@yandex.ru',
                pass: process.env.YANDEX_APP_PASSWORD || 'odzrlxaljozhfeeo',
            },
        });
    }

    async sendEmail(to: string, subject: string, text: string, html?: string) {
        try {
            const mailOptions = {
                    from: `Business Designer <${process.env.YANDEX_EMAIL ?? 'qazasd2014@yandex.ru'}>`,
                    to,
                    subject,
                    text,
                    html: html || text,
            };

            const result = await this.transporter.sendMail(mailOptions);
      
            return {
                success: true,
                messageId: result.messageId,
                response: result.response,
            };
        } catch (error) {
            console.error('❌ Ошибка отправки email:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async sendAgentEmail(agentName: string, to: string, text: string) {
        const subject = `[Business Designer]: Агент ${agentName}.`;
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h3 style="color: #333;">Уведомление агента ${agentName}.</h3>
            <p>${text}</p>
            <br>
            <p>С уважением,<br>Команда <strong>Business Designer</strong></p>
        </div>
        `;

        return this.sendEmail(to, subject, `Уведомление: ${text}.`, html);
    }
}

export const yandexEmailService = new YandexEmailService();