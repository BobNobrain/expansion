import { type Component } from 'solid-js';
import styles from './TextInput.module.css';
import { registerInFormContext } from '../Form';

export type TextInputProps = {
    value: string;
    onUpdate: (newValue: string, ev: Event) => void;
    onKeyUp?: (ev: KeyboardEvent) => void;

    readonly?: boolean;
    password?: boolean;
    placeholder?: string;

    formKey?: string;
};

export const TextInput: Component<TextInputProps> = (props) => {
    const updateValue = (ev: Event) => {
        props.onUpdate((ev.target as HTMLInputElement).value, ev);
    };

    if (props.formKey) {
        registerInFormContext(props, {});
    }

    return (
        <div class={styles.wrapper}>
            <input
                class={styles.input}
                value={props.value}
                onInput={updateValue}
                readOnly={props.readonly}
                type={props.password ? 'password' : 'text'}
                placeholder={props.placeholder}
                onKeyUp={props.onKeyUp}
            />
        </div>
    );
};
