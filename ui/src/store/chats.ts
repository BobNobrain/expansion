import { createStore } from 'solid-js/store';
import { ws } from '../lib/net/ws';
import {
    type ChatHistoryCommandPayload,
    type ChatHistoryResultPayload,
    type ChatListResultPayload,
    type ChatPostedEventPayload,
} from '../lib/net/types.generated';

const SCOPE_NAME = 'chat';
enum ChatCommand {
    Post = 'post',
    List = 'list',
    History = 'history',
}

export type ChatData = {
    id: string;
    title: string;
    messages: ChatMessageData[];

    loading: boolean;
    noHistoryLeft: boolean;
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

const [userChats, updateUserChats] = createStore<Record<string, ChatData>>({});

ws.subscribe(SCOPE_NAME, (ev) => {
    switch (ev.event) {
        case 'post': {
            const { chatId, messageId, author, content, date } = ev.payload as ChatPostedEventPayload;
            updateUserChats(chatId, 'messages', (ms) => [
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
    requestMoreMessages: (chatId: string) => void;
    postMessage: (paylod: PostMessagePayload) => Promise<void>;
};

export const useChats = (): UseChatsResult => {
    if (!Object.keys(userChats).length) {
        void ws.sendCommand(SCOPE_NAME, ChatCommand.List, {}).then((r) => {
            const result = r as ChatListResultPayload;
            const chats: Record<string, ChatData> = {};

            for (const chat of result.chats) {
                chats[chat.chatId] = {
                    id: chat.chatId,
                    title: chat.title,
                    messages: [],
                    loading: false,
                    noHistoryLeft: false,
                };
            }

            updateUserChats(chats);
        });
    }

    return {
        getChatsList: () => Object.values(userChats),
        getChatMessages: (chatId) => {
            return userChats[chatId]?.messages ?? [];
        },
        postMessage: async (payload) => {
            await ws.sendCommand(SCOPE_NAME, ChatCommand.Post, {
                chatId: payload.chatId,
                content: payload.content,
            });
        },
        requestMoreMessages: (chatId) => {
            const chat = userChats[chatId];
            if (chat.loading || chat.noHistoryLeft) {
                return;
            }

            updateUserChats(chatId, 'loading', true);

            const payload: ChatHistoryCommandPayload = {
                chatId,
                before: (userChats[chatId].messages[0]?.date ?? new Date()).toISOString(),
                limit: 100,
            };

            void ws.sendCommand(SCOPE_NAME, ChatCommand.History, payload).then((result) => {
                const olderHistory = (result as ChatHistoryResultPayload).messages.map(
                    (data): ChatMessageData => ({
                        id: data.messageId,
                        author: data.author,
                        content: data.content,
                        date: new Date(data.date),
                    }),
                );

                updateUserChats(chatId, (chat) => {
                    const newerHistory = chat.messages;
                    const mergedHistory = [...olderHistory, ...newerHistory];
                    mergedHistory.sort((m1, m2) => m1.date.getTime() - m2.date.getTime());
                    return {
                        ...chat,
                        messages: mergedHistory,
                        loading: false,
                        noHistoryLeft: !olderHistory.length,
                    };
                });
            });
        },
    };
};
