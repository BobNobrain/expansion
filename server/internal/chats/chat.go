package chats

import (
	"slices"
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/encodables"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"sync"
	"time"
)

type chatRepoImpl struct {
	mu sync.Mutex

	chats    map[domain.ChatID]*domain.ChatData
	messages map[domain.ChatID][]*domain.ChatMessageData

	comms components.Comms
}

func NewChatRepo(comms components.Comms, dispatcher components.Dispatcher) domain.ChatRepo {
	repo := &chatRepoImpl{
		mu:       sync.Mutex{},
		chats:    make(map[domain.ChatID]*domain.ChatData),
		messages: make(map[domain.ChatID][]*domain.ChatMessageData),
		comms:    comms,
	}

	dispatcher.RegisterHandler(repo)

	return repo
}

func (impl *chatRepoImpl) ListChatsForUser(uname domain.Username) ([]*domain.ChatData, common.Error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	result := make([]*domain.ChatData, 0)
	for _, ch := range impl.chats {
		if slices.Index(ch.MemberUsernames, uname) != -1 {
			result = append(result, ch)
		}
	}
	return result, nil
}

func (impl *chatRepoImpl) ListChatMessages(filter *domain.ChatHistoryFilter) ([]*domain.ChatMessageData, common.Error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	history := impl.messages[filter.ChatID]

	result := make([]*domain.ChatMessageData, 0)
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

func (impl *chatRepoImpl) CreateChat(data *domain.ChatCreateData) (*domain.ChatData, common.Error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	newChat := domain.ChatData{
		ChatID:          domain.NewChatID(),
		Title:           data.Title,
		MemberUsernames: data.MemberUsernames,
	}

	impl.chats[newChat.ChatID] = &newChat

	return &newChat, nil
}

func (impl *chatRepoImpl) InviteMember(cid domain.ChatID, username domain.Username) common.Error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	chatData, found := impl.chats[cid]
	if !found {
		return NewChatNotFoundError(cid)
	}

	chatData.MemberUsernames = append(chatData.MemberUsernames, username)
	return nil
}

func (impl *chatRepoImpl) KickMember(cid domain.ChatID, username domain.Username) common.Error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	chatData, found := impl.chats[cid]
	if !found {
		return NewChatNotFoundError(cid)
	}

	chatData.MemberUsernames = utils.FastRemove(chatData.MemberUsernames, username)
	return nil
}

func (impl *chatRepoImpl) PostMessage(data *domain.PostChatMessageData) (*domain.ChatMessageData, common.Error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	chat, found := impl.chats[data.ChatID]
	if !found {
		return nil, NewChatNotFoundError(data.ChatID)
	}
	if slices.Index(chat.MemberUsernames, data.Author) == -1 {
		return nil, NewChatNotFoundError(data.ChatID)
	}

	msgs := impl.messages[data.ChatID]
	newMsg := &domain.ChatMessageData{
		MessageID: domain.NewMessageID(),
		Author:    data.Author,
		Content:   data.Content,
		PostedAt:  time.Now(),
	}

	impl.messages[data.ChatID] = append(msgs, newMsg)

	impl.broadcastPostedMessage(chat, newMsg)

	return newMsg, nil
}

func (impl *chatRepoImpl) broadcastPostedMessage(chat *domain.ChatData, msg *domain.ChatMessageData) {
	impl.comms.Broadcast(components.CommsBroadcastRequest{
		Scope:      scope,
		Event:      "post",
		Recepients: chat.MemberUsernames,
		Payload:    encodables.NewChatPostedEvent(chat, msg),
	})
}
