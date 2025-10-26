import { type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type Icon } from '@/icons';
import styles from './SceneControls.module.css';

export type SceneControlsButtonProps = {
    icon: Icon;
    isActive?: boolean;
    onClick?: (ev: MouseEvent) => void;
};

export const SceneControlsButton: Component<SceneControlsButtonProps> = (props) => {
    return (
        <button
            type="button"
            class={styles.button}
            classList={{
                [styles.active]: props.isActive,
            }}
            onClick={props.onClick}
        >
            <Dynamic component={props.icon} size={32} block />
        </button>
    );
};
