import { WSError } from '../net/ws';
import { type DatafrontError } from './types';

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
