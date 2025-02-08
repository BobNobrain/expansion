import { type ParentComponent, Show, type JSX } from 'solid-js';
import styles from './TouchModal.module.css';
import { Text } from '../../../components/Text/Text';

export type TouchModalProps = {
    title?: string | JSX.Element;
    isOpen: boolean;
    onClose?: () => void;
};

export const TouchModal: ParentComponent<TouchModalProps> = (props) => {
    return (
        <div
            class={styles.backdrop}
            classList={{
                [styles.visible]: props.isOpen,
            }}
            onClick={props.onClose}
        >
            <div class={styles.content}>
                <Show when={props.title}>
                    <Text size="h2">{props.title}</Text>
                </Show>
                {props.children}
            </div>
        </div>
    );
};

export const TouchModalActions: ParentComponent = (props) => {
    return <footer class={styles.actions}>{props.children}</footer>;
};
