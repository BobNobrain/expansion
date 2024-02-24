import { type ParentComponent, createSignal, Show } from 'solid-js';
import styles from './TouchCurtain.module.css';
import { Button } from '../../../components/Button/Button';

export type TouchCurtainProps = {
    initiallyExpanded?: boolean;
    expandable?: boolean;
    height?: 's' | 'm' | 'l';
};

const SIZE_CLS: Record<NonNullable<TouchCurtainProps['height']>, string> = {
    s: 'heightS',
    m: 'heightM',
    l: 'heightL',
};

export const TouchCurtain: ParentComponent<TouchCurtainProps> = (props) => {
    const [getIsExpanded, setIsExpanded] = createSignal(props.initiallyExpanded ?? false);
    const toggleExpanded = () => setIsExpanded((x) => !x);

    return (
        <div
            class={styles.wrapper}
            classList={{
                [styles[SIZE_CLS[props.height ?? 'm']]]: true,
            }}
        >
            <div
                class={styles.curtain}
                classList={{
                    [styles.expanded]: getIsExpanded(),
                }}
            >
                <Show when={props.expandable ?? true}>
                    <div class={styles.handle}>
                        <Button size="s" rightWing="down" onClick={toggleExpanded}>
                            :::
                        </Button>
                    </div>
                </Show>
                <div class={styles.content}>{props.children}</div>
            </div>
        </div>
    );
};
