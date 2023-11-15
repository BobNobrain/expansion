package domain

import (
	"fmt"
	"math/rand"
	"time"
)

type ChatID uint64

func NewChatID() ChatID {
	return ChatID(rand.Uint64())
}

type ChatData struct {
	ChatID          ChatID   `json:"chatID"`
	Title           string   `json:"title"`
	MemberUsernames []string `json:"memberUsernames"`
}

type ChatRepo interface {
	ListChatsForUser(uname string) ([]ChatData, error)
	ListChatMessages(ChatMessageDataFilter) ([]ChatMessageData, error)

	CreateChat(*ChatCreateData) (*ChatData, error)

	InviteMember(cid ChatID, username string) error
	KickMember(cid ChatID, username string) error

	PostMessage(PostChatMessageData) (*ChatMessageData, error)
}

type MessageID uint64

func NewMessageID() MessageID {
	return MessageID(rand.Uint64())
}

type ChatMessageData struct {
	MessageID MessageID `json:"messageID"`
	Author    string    `json:"author"`
	PostedAt  time.Time `json:"postedAt"`
	Content   string    `json:"content"`
}

type ChatMessageDataFilter struct {
	ChatID       ChatID    `json:"chatID"`
	PostedBefore time.Time `json:"postedBefore"`
	Limit        int       `json:"limit"`
}

type ChatCreateData struct {
	Title           string   `json:"title"`
	MemberUsernames []string `json:"memberUsernames"`
}

type PostChatMessageData struct {
	ChatID  ChatID
	Author  string
	Content string
}

type ChatNotFoundError struct {
	ChatID ChatID
}

func (e *ChatNotFoundError) Error() string {
	return fmt.Sprintf("no chat with id %d", e.ChatID)
}

func NewChatNotFoundError(chatID ChatID) *ChatNotFoundError {
	return &ChatNotFoundError{ChatID: chatID}
}
