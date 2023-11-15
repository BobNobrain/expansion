import { type Component, type JSX, type ParentProps } from 'solid-js';
import styles from './FormField.module.css';

export type FormFieldProps = {
    label?: string | JSX.Element;
};

export const FormField: Component<ParentProps<FormFieldProps>> = (props) => {
    return (
        <label class={styles.field}>
            <div
                class={styles.label}
                classList={{
                    [styles.empty]: !props.label,
                }}
            >
                {props.label}
            </div>
            <div class={styles.input}>{props.children}</div>
        </label>
    );
};
