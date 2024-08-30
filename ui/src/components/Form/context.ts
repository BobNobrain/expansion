import { createContext, onCleanup, useContext } from 'solid-js';
import { type FormFieldRegistrationData, type FormFieldController } from './types';

export type FormContext = {
    registerControl: (key: string | number, field: FormFieldController) => FormFieldRegistrationData;
    unregisterControl: (key: string | number) => void;
};

export const FormContext = createContext<FormContext | null>(null);

export const registerInFormContext = (
    props: {
        value?: unknown;
        formKey?: string;
    },
    field: Partial<FormFieldController>,
): FormFieldRegistrationData => {
    if (!props.formKey) {
        return { initialValue: undefined };
    }

    const ctx = useContext(FormContext);
    if (ctx === null) {
        return {
            initialValue: undefined,
        };
    }

    const controller: FormFieldController = {
        retrieveValue: () => props.value,
        validate: () => true,
        ...field,
    };

    const data = ctx.registerControl(props.formKey, controller);
    onCleanup(() => {
        ctx.unregisterControl(props.formKey!);
    });

    return data;
};
