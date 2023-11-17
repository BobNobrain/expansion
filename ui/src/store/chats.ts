import { createStore } from 'solid-js/store';
import { ws } from '../lib/net/ws';
import { type ChatListResultPayload, type ChatPostedEventPayload } from '../lib/net/types.generated';

const SCOPE_NAME = 'chat';

export type ChatData = {
    id: string;
    title: string;
    messages: ChatMessageData[];
};

export type ChatMessageData = {
    id: number;
    author: string;
    content: string;
    date: Date;
};

export type PostMessagePayload = {
    chatId: string;
    content: string;
};

const [userChats, setUserChats] = createStore<Record<string, ChatData>>({});

ws.subscribe(SCOPE_NAME, (ev) => {
    switch (ev.event) {
        case 'post': {
            const { chatId, messageId, author, content, date } = ev.payload as ChatPostedEventPayload;
            setUserChats(chatId, 'messages', (ms) => [
                ...ms,
                {
                    id: messageId,
                    author,
                    content,
                    date: new Date(date),
                },
            ]);
            break;
        }

        default:
            console.log('unknown event', ev);
    }
});

export type UseChatsResult = {
    getChatsList: () => ChatData[];
    getChatMessages: (chatId: string) => ChatMessageData[];
    postMessage: (paylod: PostMessagePayload) => Promise<void>;
};

export const useChats = (): UseChatsResult => {
    if (!Object.keys(userChats).length) {
        void ws.sendCommand(SCOPE_NAME, 'list', {}).then((r) => {
            const result = r as ChatListResultPayload;
            const chats: Record<string, ChatData> = {};

            for (const chat of result.chats) {
                chats[chat.chatId] = {
                    id: chat.chatId,
                    title: chat.title,
                    messages: [],
                };
            }

            setUserChats(chats);
        });
    }

    return {
        getChatsList: () => Object.values(userChats),
        getChatMessages: (chatId) => {
            return userChats[chatId]?.messages ?? [];
        },
        postMessage: async (payload) => {
            await ws.sendCommand(SCOPE_NAME, 'post', {
                chatId: payload.chatId,
                content: payload.content,
            });
        },
    };
};
