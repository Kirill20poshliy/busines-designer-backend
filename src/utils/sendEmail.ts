import { Resend } from 'resend';
import 'dotenv';

export const sendAgentEmail = async (
    email: string, 
    text: string, 
    agentName?: string,
): Promise<{success: boolean, error: string | undefined}> => {
    try {
        const apiKey = process.env.RESEND_KEY || 're_VfxJjkdy_9nWkAqewVRZiDRpu2W1Lc8Kg'
        const resend = new Resend(apiKey);
        
        const { error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [email],
            subject: `[Business Designer]: Агент ${agentName ? agentName + ' ' : ''}.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h3 style="color: #333;">Уведомление агента ${agentName}.</h3>
                    <p>${text}</p>
                    <br>
                    <p>С уважением,<br>Команда <strong>Business Designer</strong></p>
                </div>
            `,
        });

        if (error) {
            throw new Error(`Ошибка отправки email: ${error.message}`);
        }

        return { success: true, error: undefined }
    } catch (e) {
        return {
            success: false,
            error: (e as Error).message,
        }
    }
}