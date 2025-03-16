import { createContext, onCleanup, useContext } from 'solid-js';
import { type FormFieldController } from './types';

export type FormContext = {
    registerControl: (key: string | number, field: FormFieldController) => void;
    unregisterControl: (key: string | number) => void;
};

export const FormContext = createContext<FormContext | null>(null);

export const registerInFormContext = (
    props: {
        value?: unknown;
        formKey?: string;
    },
    field: Partial<FormFieldController>,
): void => {
    if (props.formKey === undefined) {
        return;
    }

    const ctx = useContext(FormContext);
    if (ctx === null) {
        return;
    }

    const controller: FormFieldController = {
        retrieveValue: () => props.value,
        validate: () => true,
        ...field,
    };

    ctx.registerControl(props.formKey, controller);
    onCleanup(() => {
        ctx.unregisterControl(props.formKey!);
    });
};
