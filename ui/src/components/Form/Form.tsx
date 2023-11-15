import { type ParentComponent } from 'solid-js';
import styles from './Form.module.css';

export type FormProps = {
    labelWidth?: string;
    loading?: boolean;
};

export const Form: ParentComponent<FormProps> = (props) => {
    return (
        <div
            class={styles.form}
            classList={{
                [styles.loading]: props.loading,
            }}
            style={{ '--form-label-width': props.labelWidth }}
        >
            {props.children}
        </div>
    );
};
