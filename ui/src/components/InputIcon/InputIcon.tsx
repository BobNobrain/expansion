import { type Component } from 'solid-js';
import styles from './InputIcon.module.css';

export type InputIconProps = {
    type: 'hint' | 'error' | 'success' | 'lock';
};

export const InputIcon: Component<InputIconProps> = (props) => {
    return (
        <div class={styles.icon} classList={{ [styles[props.type]]: true }}>
            -
        </div>
    );
};
