import { type Component } from 'solid-js';
import styles from './TextInput.module.css';

export type TextInputProps = {
    value: string;
    onUpdate: (newValue: string, ev: Event) => void;
    onKeyUp?: (ev: KeyboardEvent) => void;

    readonly?: boolean;
    password?: boolean;

    placeholder?: string;
};

export const TextInput: Component<TextInputProps> = (props) => {
    const updateValue = (ev: Event) => {
        props.onUpdate((ev.target as HTMLInputElement).value, ev);
    };

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
