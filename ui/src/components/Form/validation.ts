import { createSignal } from 'solid-js';
import { type ValidationState } from './types';

export type ValidationStateController = {
    get: () => ValidationState | undefined;
    getColor: () => 'error' | 'success' | 'none';
    getErrorMessage: () => string | undefined;

    setError: (message?: string) => void;
    setOk: () => void;
    setSuccess: () => void;
    setLoading: () => void;
    clear: () => void;
};

export function useValidationState(onChange?: (vs: ValidationState | undefined) => void): ValidationStateController {
    const [getVs, setVs] = createSignal<ValidationState | undefined>();

    const setOk = () => {
        const vs: ValidationState = { type: 'ok' };
        setVs(vs);
        onChange?.(vs);
    };
    const setError = (msg?: string) => {
        const vs: ValidationState = { type: 'error', message: msg };
        setVs(vs);
        onChange?.(vs);
    };
    const setSuccess = () => {
        const vs: ValidationState = { type: 'ok', explicitSuccess: true };
        setVs(vs);
        onChange?.(vs);
    };
    const setLoading = () => {
        const vs: ValidationState = { type: 'loading' };
        setVs(vs);
        onChange?.(vs);
    };
    const clear = () => {
        const vs = undefined;
        setVs(vs);
        onChange?.(vs);
    };

    const getColor = () => {
        const vs = getVs();
        switch (vs?.type) {
            case 'error':
                return 'error';
            case 'ok':
                return vs.explicitSuccess ? 'success' : 'none';

            default:
                return 'none';
        }
    };

    const getErrorMessage = () => {
        const vs = getVs();
        if (vs && vs.type === 'error') {
            return vs.message;
        }
        return undefined;
    };

    return {
        get: getVs,
        getColor,
        getErrorMessage,
        setError,
        setOk,
        setSuccess,
        setLoading,
        clear,
    };
}
