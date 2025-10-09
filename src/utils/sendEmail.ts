import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);

export const sendAgentEmail = async (
    email: string, 
    text: string, 
    // agentName?: string
): Promise<{success: boolean, error: string | undefined}> => {
    try {
        const { error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [email],
            subject: 'Агент Business Designer завершил работу!',
            html: `
                <div>
                    <p>${text}</p>
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