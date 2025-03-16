import { type ParentProps } from 'solid-js';
import styles from './Form.module.css';

export type FormProps = {
    loading?: boolean;
    onSubmit?: () => void;
};

export function Form(props: ParentProps<FormProps>) {
    const handleSubmit = (ev: Event) => {
        ev.preventDefault();
        props.onSubmit?.();
    };

    return (
        <form
            class={styles.form}
            classList={{
                [styles.loading]: props.loading,
            }}
            onSubmit={handleSubmit}
        >
            {props.children}
        </form>
    );
}
