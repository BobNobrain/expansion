import { type ParentProps } from 'solid-js';
import { FormContext, registerInFormContext } from './context';
import { type FormFieldController } from './types';
import styles from './Form.module.css';

export type FormProps<T extends Record<string | number, unknown>> = {
    labelWidth?: string;
    loading?: boolean;

    formKey?: string;
    initialValue?: T;
};

export function Form<T extends Record<string | number, unknown>>(props: ParentProps<FormProps<T>>) {
    const controls: Record<string, FormFieldController> = {};

    const controller: FormFieldController = {
        validate: () => {
            let result = true;
            for (const controller of Object.values(controls)) {
                // we must trigger validation on all fields
                result &&= controller.validate();
            }
            return result;
        },
        retrieveValue: () => {
            const result: Record<string, unknown> = {};
            for (const [key, controller] of Object.entries(controls)) {
                result[key] = controller.retrieveValue();
            }
            return result as T;
        },
    };

    const { initialValue = props.initialValue } = registerInFormContext(props, controller);

    const ctx: FormContext = {
        registerControl: (key, field) => {
            controls[key] = field;
            return {
                initialValue: initialValue ? (initialValue as T)[key] : undefined,
            };
        },
        unregisterControl: (key) => {
            delete controls[key];
        },
    };

    return (
        <FormContext.Provider value={ctx}>
            <div
                class={styles.form}
                classList={{
                    [styles.loading]: props.loading,
                }}
                style={{ '--form-label-width': props.labelWidth }}
            >
                {props.children}
            </div>
        </FormContext.Provider>
    );
}
