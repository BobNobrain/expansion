import { For, type Component, onMount } from 'solid-js';
import throttle from 'lodash/throttle';
import { type ChatData, useChats } from '../../../../store/chats';
import { InlineLoader } from '../../../../components/InlineLoader/InlineLoader';
import { Text } from '../../../../components/Text/Text';
import styles from './ChatMessages.module.css';

export type ChatMessagesProps = {
    activeChat: ChatData;
};

const SCROLL_TRESHOLD_PX = 100;

export const ChatMessages: Component<ChatMessagesProps> = (props) => {
    const chats = useChats();
    let scrollableWrapper!: HTMLDivElement;

    const requestOlderHistory = () => {
        if (!props.activeChat) {
            return;
        }
        chats.requestMoreMessages(props.activeChat.id);
    };

    const requestOlderHistoryThrottled = throttle(requestOlderHistory, 100, { leading: true, trailing: false });
    const onHistoryScroll = (ev: Event & { currentTarget: HTMLDivElement }) => {
        if (ev.currentTarget.scrollTop < SCROLL_TRESHOLD_PX) {
            requestOlderHistoryThrottled();
        }
    };

    onMount(() => {
        scrollableWrapper.scroll({ behavior: 'instant', top: scrollableWrapper.scrollHeight });
        requestOlderHistoryThrottled();
    });

    return (
        <div class={styles.messageHistory} ref={scrollableWrapper} onScroll={onHistoryScroll}>
            <InlineLoader />
            <For each={props.activeChat.messages}>
                {(msg) => {
                    return (
                        <div class={styles.message}>
                            <Text bold color="primary">
                                {msg.author}:
                            </Text>
                            {msg.content}
                            <Text color="dim">({msg.date.toLocaleString()})</Text>
                        </div>
                    );
                }}
            </For>
        </div>
    );
};
