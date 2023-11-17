import { For, type Component, createSignal, Show } from 'solid-js';
import { type ChatData, useChats } from '../../../store/chats';
import { Text } from '../../Text/Text';
import styles from './ChatWindow.module.css';
import { TextInput } from '../../TextInput/TextInput';

export const ChatWindow: Component = () => {
    const chats = useChats();
    const [getActiveChat, setActiveChat] = createSignal<ChatData | null>(null);

    const [getMessageText, setMessageText] = createSignal('');

    const handleEnter = (ev: KeyboardEvent) => {
        if (ev.code !== 'Enter') {
            return;
        }

        const chatId = getActiveChat()!.id;
        const text = getMessageText();
        setMessageText('');

        void chats.postMessage({
            chatId,
            content: text,
        });
    };

    return (
        <div class={styles.wrapper}>
            <div class={styles.chatList}>
                <For each={chats.getChatsList()}>
                    {(chat) => {
                        return (
                            <div
                                class={styles.chatTitle}
                                classList={{
                                    [styles.selectedChat]: chat === getActiveChat(),
                                }}
                                onClick={() => setActiveChat(chat)}
                            >
                                {chat.title}
                            </div>
                        );
                    }}
                </For>
            </div>
            <div class={styles.activeChat}>
                <Show when={getActiveChat()} fallback={<div class={styles.empty}>No chat selected</div>}>
                    <div class={styles.messageHistory}>
                        <For each={getActiveChat()!.messages}>
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
                    <div class={styles.input}>
                        <TextInput
                            value={getMessageText()}
                            onUpdate={setMessageText}
                            placeholder="Type your message..."
                            onKeyUp={handleEnter}
                        />
                    </div>
                </Show>
            </div>
        </div>
    );
};
