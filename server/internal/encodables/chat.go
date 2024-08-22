package encodables

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"time"
)

type chatPostedEvent struct {
	ChatID    domain.ChatID
	MessageID domain.MessageID
	Author    domain.UserID
	Date      time.Time
	Content   string
}

func NewChatPostedEvent(chat *domain.ChatData, msg *domain.ChatMessageData) common.Encodable {
	return &chatPostedEvent{
		ChatID:    chat.ChatID,
		MessageID: msg.MessageID,
		Author:    msg.Author,
		Date:      msg.PostedAt,
		Content:   msg.Content,
	}
}

func (ev *chatPostedEvent) Encode() interface{} {
	return &api.ChatPostedEventPayload{
		ChatID:    string(ev.ChatID),
		MessageID: uint64(ev.MessageID),
		Author:    string(ev.Author),
		Date:      ev.Date,
		Content:   ev.Content,
	}
}

type chatListResponse struct {
	chats []*domain.ChatData
}

func NewChatListResponse(chats []*domain.ChatData) common.Encodable {
	return &chatListResponse{chats: chats}
}

func (r *chatListResponse) Encode() interface{} {
	apiChats := make([]api.ChatListResultPayloadItem, 0, len(r.chats))
	for _, chat := range r.chats {
		apiChats = append(apiChats, api.ChatListResultPayloadItem{
			ChatID: string(chat.ChatID),
			Title:  chat.Title,
		})
	}

	return &api.ChatListResultPayload{
		Chats: apiChats,
	}
}

type chatHistoryResponse struct {
	history []*domain.ChatMessageData
}

func NewChatHistoryResponse(history []*domain.ChatMessageData) common.Encodable {
	return &chatHistoryResponse{history: history}
}

func (r *chatHistoryResponse) Encode() interface{} {
	apiMessages := make([]api.ChatHistoryResultPayloadItem, 0, len(r.history))
	for _, msg := range r.history {
		apiMessages = append(apiMessages, api.ChatHistoryResultPayloadItem{
			MessageID: uint64(msg.MessageID),
			Author:    string(msg.Author),
			Date:      msg.PostedAt,
			Content:   msg.Content,
		})
	}

	return &api.ChatHistoryResultPayload{
		Messages: apiMessages,
	}
}
