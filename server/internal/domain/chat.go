package domain

import (
	"math/rand"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"time"
)

type ChatID string

func NewChatID() ChatID {
	return ChatID(utils.GenerateRandomStringID(16))
}

type ChatData struct {
	ChatID          ChatID
	Title           string
	MemberUsernames []Username
}

type ChatRepo interface {
	ListChatsForUser(uname Username) ([]*ChatData, common.Error)
	ListChatMessages(*ChatHistoryFilter) ([]*ChatMessageData, common.Error)

	CreateChat(*ChatCreateData) (*ChatData, common.Error)

	InviteMember(cid ChatID, username Username) common.Error
	KickMember(cid ChatID, username Username) common.Error

	PostMessage(*PostChatMessageData) (*ChatMessageData, common.Error)
}

type MessageID uint64

func NewMessageID() MessageID {
	return MessageID(rand.Uint64())
}

type ChatMessageData struct {
	MessageID MessageID
	Author    Username
	PostedAt  time.Time
	Content   string
}

type ChatHistoryFilter struct {
	ChatID       ChatID
	PostedBefore time.Time
	Limit        int
}

type ChatCreateData struct {
	Title           string
	MemberUsernames []Username
}

type PostChatMessageData struct {
	ChatID  ChatID
	Author  Username
	Content string
}
