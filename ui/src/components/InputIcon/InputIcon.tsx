import { type Component } from 'solid-js';
import styles from './InputIcon.module.css';

export type InputIconProps = {
    type: 'hint' | 'error' | 'success' | 'lock';
};

const tempIcons: Record<InputIconProps['type'], string> = {
    hint: '?',
    error: '!',
    success: 'v',
    lock: 'x',
};

export const InputIcon: Component<InputIconProps> = (props) => {
    return (
        <div class={styles.icon} classList={{ [styles[props.type]]: true }}>
            {tempIcons[props.type]}
        </div>
    );
};
