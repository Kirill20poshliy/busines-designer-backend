import tokensService from '../services/tokens.service';

export const startTokenCleanup = (intervalMs: number = 24 * 60 * 60 * 1000) => {
    setInterval(async () => {
        try {
            console.log('Starting token cleanup...');
            await tokensService.cleanupExpiredTokens();
            console.log('Token cleanup completed');
        } catch (error) {
            console.error('Token cleanup error:', error);
        }
    }, intervalMs);
};

startTokenCleanup();