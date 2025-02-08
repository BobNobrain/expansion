/** @deprecated TODO: remove */

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

export type UseChatsResult = {
    getChatsList: () => ChatData[];
    getChatMessages: (chatId: string) => ChatMessageData[];
    requestMoreMessages: (chatId: string) => void;
    postMessage: (paylod: PostMessagePayload) => Promise<void>;
};

export const useChats = (): UseChatsResult => {
    return {
        getChatsList: () => [],
        getChatMessages: () => {
            return [];
        },
        postMessage: async () => {},
        requestMoreMessages: () => {},
    };
};
