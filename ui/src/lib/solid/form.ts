import { createEffect, createMemo, createSignal, untrack } from 'solid-js';

export type FormController<T> = {
    validateAndGetResult: () => T | null;
    dataVersion: () => number;
};

export type CreateFormControllerResult<T> = {
    controller: FormController<T>;
    onDataUpdated: () => void;
};

export type CreateFormControllerOptions<T> = {
    validateAndGetResult: () => T | null;
};

export function createFormController<T>({
    validateAndGetResult,
}: CreateFormControllerOptions<T>): CreateFormControllerResult<T> {
    const [getVersion, setVersion] = createSignal(0);

    return {
        controller: {
            validateAndGetResult,
            dataVersion: getVersion,
        },
        onDataUpdated: () => setVersion((v) => v + 1),
    };
}
export function useFormControllerRef<T, PropName extends string>(
    c: FormController<T>,
    props: Partial<Record<PropName, ((c: FormController<T>) => void) | undefined>>,
    propName: PropName,
) {
    createEffect(() => props[propName]?.(c));
}

export type UseFormControllerResult<T> = Pick<FormController<T>, 'validateAndGetResult'> & {
    isDirty: () => boolean;
    markClean: () => void;
    ref: (c: FormController<T>) => void;
};

export function useFormController<T>(): UseFormControllerResult<T> {
    const [getController, setController] = createSignal<FormController<T> | null>(null);
    const [getLastCleanVersion, setLastCleanVersion] = createSignal(NaN);

    const isDirty = createMemo(() => {
        const c = getController();
        if (!c) {
            return false;
        }

        return c.dataVersion() !== getLastCleanVersion();
    });

    const markClean = () => {
        const c = getController();
        if (!c) {
            return;
        }

        const version = untrack(c.dataVersion);
        setLastCleanVersion(version);
    };

    const ref = (c: FormController<T>) => setController(c);

    return {
        validateAndGetResult: () => getController()?.validateAndGetResult() ?? null,
        isDirty,
        markClean,
        ref,
    };
}
