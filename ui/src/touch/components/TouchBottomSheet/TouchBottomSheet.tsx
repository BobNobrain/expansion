import { type JSX, Show, type ParentComponent, createEffect } from 'solid-js';
import { stopPropagation } from '../../../lib/misc';
import { useDebouncedScrollHandler } from '../../../lib/solid/scroll';
import styles from './TouchBottomSheet.module.css';

export type TouchBottomSheetProps = {
    header?: JSX.Element;
    isOpen: boolean;
    onClose?: () => void;
};

export const TouchBottomSheet: ParentComponent<TouchBottomSheetProps> = (props) => {
    let wrapper!: HTMLDivElement;

    const scrollToContent = () => {
        wrapper.scroll({ left: 0, top: wrapper.scrollHeight - wrapper.clientHeight, behavior: 'smooth' });
    };

    const scrollHandler = useDebouncedScrollHandler(() => {
        if (wrapper.scrollTop !== 0) {
            return;
        }

        if (props.onClose) {
            props.onClose();
            return;
        }

        // uncloseable, scroll the content back up into view
        scrollToContent();
    });

    createEffect(() => {
        if (props.isOpen) {
            scrollToContent();
        } else {
            wrapper.scroll({ left: 0, top: 0, behavior: 'smooth' });
        }
    });

    return (
        <div
            ref={wrapper}
            class={styles.wrapper}
            classList={{
                [styles.visible]: props.isOpen,
            }}
            on:scroll={scrollHandler}
            onClick={props.onClose}
        >
            <div class={styles.backdrop} />
            <aside class={styles.content} onClick={stopPropagation}>
                <Show when={props.header}>
                    <div class={styles.header}>{props.header}</div>
                </Show>
                {props.children}
            </aside>
        </div>
    );
};
