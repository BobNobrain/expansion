import { type ParentComponent, createSignal, type JSX, Show } from 'solid-js';
import styles from './TouchCurtain.module.css';
import { Button } from '../../../components/Button/Button';

export type TouchCurtainProps = {
    static?: JSX.Element;
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

    let inTransition = false;
    let frameN = 0;
    const resizeOnTransition = () => {
        if (frameN % 1 === 0) {
            window.dispatchEvent(new Event('resize'));
        }

        ++frameN;
        if (inTransition) {
            requestAnimationFrame(resizeOnTransition);
        }
    };
    const onStart = () => {
        inTransition = true;
        frameN = 0;

        requestAnimationFrame(resizeOnTransition);
    };
    const onEnd = () => {
        inTransition = false;
        window.dispatchEvent(new Event('resize'));
    };

    return (
        <div
            class={styles.layout}
            classList={{
                [styles[SIZE_CLS[props.height ?? 'm']]]: true,
            }}
        >
            <div class={styles.static}>{props.static}</div>
            <div class={styles.placeholder} onTransitionStart={onStart} onTransitionEnd={onEnd}>
                <div
                    class={styles.curtain}
                    classList={{
                        [styles.expanded]: getIsExpanded(),
                    }}
                >
                    <Show when={props.expandable ?? true}>
                        <div class={styles.handle}>
                            <Button size="s" onClick={toggleExpanded}>
                                &lt;|&gt;
                            </Button>
                        </div>
                    </Show>
                    <div class={styles.content}>{props.children}</div>
                </div>
            </div>
        </div>
    );
};
