package api

import "time"

type ChatPostedEventPayload struct {
	ChatID    string    `json:"chatId"`
	MessageID uint64    `json:"messageId"`
	Author    string    `json:"author"`
	Date      time.Time `json:"date"`
	Content   string    `json:"content"`
}

type ChatListResultPayload struct {
	Chats []ChatListResultPayloadItem `json:"chats"`
}

type ChatListResultPayloadItem struct {
	ChatID string `json:"chatId"`
	Title  string `json:"title"`
}
