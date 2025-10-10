export const convertMilliseconds = (
    count: number,
    type: string | undefined
): number => {
    switch (type) {
        case 'seconds':
            return count * 1000;
        case 'minutes':
            return count * 1000 * 60;
        case 'hours':
            return count * 1000 * 60 * 60;
        case 'days':
            return count * 1000 * 60 * 60 * 24;
        default:
            return count;
    }
};
