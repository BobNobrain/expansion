package domain

import (
	"math/rand"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"time"
)

type ChatID string

func NewChatID() ChatID {
	return ChatID(utils.GenerateRandomStringID(16, rand.New(rand.NewSource(rand.Int63()))))
}

type ChatData struct {
	ChatID    ChatID
	Title     string
	MemberIDs []UserID
}

type ChatRepo interface {
	ListChatsForUser(UserID) ([]*ChatData, common.Error)
	ListChatMessages(*ChatHistoryFilter) ([]*ChatMessageData, common.Error)

	CreateChat(*ChatCreateData) (*ChatData, common.Error)

	InviteMember(ChatID, UserID) common.Error
	KickMember(ChatID, UserID) common.Error

	PostMessage(*PostChatMessageData) (*ChatMessageData, common.Error)
}

type MessageID uint64

func NewMessageID() MessageID {
	return MessageID(rand.Uint64())
}

type ChatMessageData struct {
	MessageID MessageID
	Author    UserID
	PostedAt  time.Time
	Content   string
}

type ChatHistoryFilter struct {
	ChatID       ChatID
	PostedBefore time.Time
	Limit        int
}

type ChatCreateData struct {
	Title     string
	MemberIDs []UserID
}

type PostChatMessageData struct {
	ChatID  ChatID
	Author  UserID
	Content string
}
