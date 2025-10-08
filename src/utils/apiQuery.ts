import axios from 'axios';

class ApiQuery {
    async get(url: string): Promise<{data: unknown, status: number}> {
        try {
            const result = await axios.get(url);
            return {
                data: result.data,
                status: result.status
            }
        } catch (e) {
            return {
                data: e,
                status: 500
            }
        }
    }

    async post(url: string, body: unknown): Promise<{data: unknown, status: number}> {
        try {
            const result = await axios.post(url, body);
            return {
                data: result.data,
                status: result.status
            }
        } catch (e) {
            return {
                data: e,
                status: 500
            }
        }
    }
}

export default new ApiQuery()