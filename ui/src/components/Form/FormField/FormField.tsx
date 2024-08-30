import { createSignal, Show, type JSX, type ParentProps } from 'solid-js';
import styles from './FormField.module.css';

export type FormFieldProps = {
    label?: string | JSX.Element;
    description?: string;
    multiline?: boolean;

    collapsable?: boolean;
    collapsedPreview?: string | JSX.Element;
    onToggleCollapsed?: (isCollapsed: boolean) => void;
};

export function FormField(props: ParentProps<FormFieldProps>) {
    const [isCollapsed, setIsCollapsed] = createSignal(false);

    const onCollapsableLabelClick = () => {
        if (!props.collapsable || !props.multiline) {
            return;
        }

        const toggled = !isCollapsed();
        props.onToggleCollapsed?.(toggled);
        setIsCollapsed(toggled);
    };

    return (
        <div
            class={styles.field}
            classList={{
                [styles.multiline]: props.multiline,
                [styles.collapsed]: props.multiline && props.collapsable && isCollapsed(),
            }}
        >
            <div
                class={styles.label}
                classList={{
                    [styles.empty]: !props.label,
                    [styles.collapsable]: props.collapsable,
                }}
                onClick={onCollapsableLabelClick}
            >
                {props.label}
                <Show when={props.collapsable && isCollapsed() && props.collapsedPreview}>
                    <span class={styles.collapsedPreview}>{props.collapsedPreview}</span>
                </Show>
            </div>
            <div class={styles.input}>{props.children}</div>
        </div>
    );
}
