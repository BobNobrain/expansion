import { type ParentComponent, createSignal, type JSX, Show, For } from 'solid-js';
import { A } from '@solidjs/router';
import { Button } from '../../../components/Button/Button';
import { type Icon, IconCurtainExpand } from '../../../icons';
import styles from './TouchCurtain.module.css';
import { Dynamic } from 'solid-js/web';

export type TouchCurtainTab = {
    icon: Icon;
    href: string;
};

export type TouchCurtainProps = {
    static?: JSX.Element;
    initiallyExpanded?: boolean;
    expandable?: boolean;
    height?: 's' | 'm' | 'l';
    tabs?: TouchCurtainTab[];
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
                    <Show when={props.tabs?.length}>
                        <div class={styles.tabs}>
                            <div class={styles.tabsContainer}>
                                <For each={props.tabs}>
                                    {(tab) => {
                                        return (
                                            <A href={tab.href} class={styles.tab} activeClass={styles.active}>
                                                <Dynamic component={tab.icon} size={32} />
                                            </A>
                                        );
                                    }}
                                </For>
                            </div>
                        </div>
                    </Show>
                    <Show when={props.expandable ?? true}>
                        <div class={styles.handle}>
                            <Button size="s" onClick={toggleExpanded}>
                                <IconCurtainExpand size={24} />
                            </Button>
                        </div>
                    </Show>
                    <div class={styles.content}>{props.children}</div>
                </div>
            </div>
        </div>
    );
};
