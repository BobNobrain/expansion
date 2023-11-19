package api

import "time"

type ChatPostedEventPayload struct {
	ChatID    string    `json:"chatId"`
	MessageID uint64    `json:"messageId"`
	Author    string    `json:"author"`
	Date      time.Time `json:"date"`
	Content   string    `json:"content"`
}

type ChatPostCommandPayload struct {
	ChatID  string `json:"chatId"`
	Content string `json:"content"`
}

type ChatListResultPayload struct {
	Chats []ChatListResultPayloadItem `json:"chats"`
}

type ChatListResultPayloadItem struct {
	ChatID string `json:"chatId"`
	Title  string `json:"title"`
}

type ChatHistoryCommandPayload struct {
	ChatID       string    `json:"chatId"`
	PostedBefore time.Time `json:"before"`
	Limit        int       `json:"limit"`
}

type ChatHistoryResultPayload struct {
	Messages []ChatHistoryResultPayloadItem `json:"messages"`
}

type ChatHistoryResultPayloadItem struct {
	MessageID uint64    `json:"messageId"`
	Author    string    `json:"author"`
	Date      time.Time `json:"date"`
	Content   string    `json:"content"`
}
