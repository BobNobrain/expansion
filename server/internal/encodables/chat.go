package encodables

import (
	"srv/internal/domain"
	"srv/pkg/api"
	"time"
)

type ChatPostedEvent struct {
	ChatID    domain.ChatID
	MessageID domain.MessageID
	Author    domain.Username
	Date      time.Time
	Content   string
}

func NewChatPostedEvent(chat *domain.ChatData, msg *domain.ChatMessageData) *ChatPostedEvent {
	return &ChatPostedEvent{
		ChatID:    chat.ChatID,
		MessageID: msg.MessageID,
		Author:    msg.Author,
		Date:      msg.PostedAt,
		Content:   msg.Content,
	}
}

func (ev *ChatPostedEvent) Encode() interface{} {
	return &api.ChatPostedEventPayload{
		ChatID:    string(ev.ChatID),
		MessageID: uint64(ev.MessageID),
		Author:    string(ev.Author),
		Date:      ev.Date,
		Content:   ev.Content,
	}
}

type ChatListResponse struct {
	chats []*domain.ChatData
}

func NewChatListResponse(chats []*domain.ChatData) *ChatListResponse {
	return &ChatListResponse{chats: chats}
}

func (r *ChatListResponse) Encode() interface{} {
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
