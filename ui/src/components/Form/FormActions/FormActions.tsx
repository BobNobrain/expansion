import { type ParentComponent } from 'solid-js';
import styles from './FormActions.module.css';

type FormActionsAlignment = 'center' | 'right';

export type FormActionsProps = {
    align?: FormActionsAlignment;
};

const cns: Record<FormActionsAlignment, string> = {
    center: styles.center,
    right: styles.right,
};

export const FormActions: ParentComponent<FormActionsProps> = (props) => {
    return (
        <div
            class={styles.actions}
            classList={{
                [cns[props.align ?? 'right']]: true,
            }}
        >
            {props.children}
        </div>
    );
};
