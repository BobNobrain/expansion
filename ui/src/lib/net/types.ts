export interface ClientCommand {
    id: number;
    scope: string;
    command: string;
    payload: unknown;
}

export interface ServerCommandSuccessResponse {
    id: number;
    result: unknown;
}

export interface ServerCommandErrorResponse {
    id: number;
    code: string;
    error: string;
}

export interface ServerEvent {
    scope: string;
    event: string;
    payload: unknown;
}

export interface LoginResponseBody {
    username: string;
}

export interface LoginErrorBody {
    message: string;
    code: string;
    details?: unknown;
}
