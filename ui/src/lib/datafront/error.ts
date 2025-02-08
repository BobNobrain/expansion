import { WSError } from '../net/ws';

export type DatafrontError = {
    code: string;
    message: string;
    details?: unknown;
    retry?: () => void;
};

export function toDatafrontError(err: unknown, retry?: () => void): DatafrontError {
    if (!err || !(err instanceof WSError)) {
        console.error(err);
        return {
            code: '--',
            message: '--',
            retry,
        };
    }

    return {
        code: err.code,
        message: err.message,
        details: err.details,
        retry: err.isRetriable ? retry : undefined,
    };
}
