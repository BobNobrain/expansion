package stubs

import (
	"math/rand"
	"slices"
	"srv/internal/domain"
	"srv/internal/utils"
	"sync"
)

type stubChatRepo struct {
	mu sync.Mutex

	chats    map[domain.ChatID]domain.ChatData
	messages map[domain.ChatID][]domain.ChatMessageData
}

func NewStubChatRepo() domain.ChatRepo {
	return &stubChatRepo{
		mu:       sync.Mutex{},
		chats:    make(map[domain.ChatID]domain.ChatData),
		messages: make(map[domain.ChatID][]domain.ChatMessageData),
	}
}

func (impl *stubChatRepo) ListChatsForUser(uname string) ([]domain.ChatData, error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	result := make([]domain.ChatData, 0)
	for _, ch := range impl.chats {
		if slices.Index(ch.MemberUsernames, uname) != -1 {
			result = append(result, ch)
		}
	}
	return result, nil
}

func (impl *stubChatRepo) ListChatMessages(filter domain.ChatMessageDataFilter) ([]domain.ChatMessageData, error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	history, found := impl.messages[filter.ChatID]
	if !found {
		return nil, domain.NewChatNotFoundError(filter.ChatID)
	}

	result := make([]domain.ChatMessageData, 0)
	for i := len(history) - 1; i >= 0; i -= 1 {
		if len(result) >= filter.Limit {
			break
		}

		msg := history[i]
		if !filter.PostedBefore.IsZero() && msg.PostedAt.After(filter.PostedBefore) {
			continue
		}

		result = append(result, msg)
	}

	return result, nil
}

func (impl *stubChatRepo) CreateChat(data *domain.ChatCreateData) (*domain.ChatData, error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	newChat := domain.ChatData{
		ChatID:          domain.ChatID(rand.Uint64()),
		Title:           data.Title,
		MemberUsernames: data.MemberUsernames,
	}

	impl.chats[newChat.ChatID] = newChat

	return &newChat, nil
}

func (impl *stubChatRepo) InviteMember(cid domain.ChatID, username string) error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	chatData, found := impl.chats[cid]
	if !found {
		return domain.NewChatNotFoundError(cid)
	}

	chatData.MemberUsernames = append(chatData.MemberUsernames, username)
	return nil
}

func (impl *stubChatRepo) KickMember(cid domain.ChatID, username string) error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	chatData, found := impl.chats[cid]
	if !found {
		return domain.NewChatNotFoundError(cid)
	}

	chatData.MemberUsernames = utils.FastRemove(chatData.MemberUsernames, username)
	return nil
}

func (impl *stubChatRepo) PostMessage(data domain.PostChatMessageData) (*domain.ChatMessageData, error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	msgs, found := impl.messages[data.ChatID]
	if !found {
		return nil, domain.NewChatNotFoundError(data.ChatID)
	}

	newMsg := domain.ChatMessageData{
		MessageID: domain.NewMessageID(),
		Author:    data.Author,
		Content:   data.Content,
	}

	impl.messages[data.ChatID] = append(msgs, newMsg)

	return &newMsg, nil
}
