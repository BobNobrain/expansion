import { type ParentComponent, Show, type JSX } from 'solid-js';
import { Button } from '@/atoms';
import { IconCross } from '@/icons';
import { stopPropagation } from '@/lib/misc';
import styles from './TouchModal.module.css';

export type TouchModalProps = {
    title?: string | JSX.Element;
    isOpen: boolean;
    top?: boolean;
    onClose?: () => void;
};

export const TouchModal: ParentComponent<TouchModalProps> = (props) => {
    return (
        <div
            class={styles.backdrop}
            classList={{
                [styles.visible]: props.isOpen,
                [styles.top]: props.top,
            }}
            onClick={props.onClose}
        >
            <div class={styles.content} onClick={stopPropagation}>
                <Show when={props.title}>
                    <header class={styles.header}>
                        <h2 class={styles.title}>{props.title}</h2>
                        <Show when={props.onClose}>
                            <Button square style="text" onClick={props.onClose}>
                                <IconCross size={20} />
                            </Button>
                        </Show>
                    </header>
                </Show>
                {props.children}
            </div>
        </div>
    );
};

export const TouchModalActions: ParentComponent = (props) => {
    return <footer class={styles.actions}>{props.children}</footer>;
};
