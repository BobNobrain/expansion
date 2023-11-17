package chats

import (
	"fmt"
	"srv/internal/domain"
	"srv/internal/encodables"
	"srv/internal/utils/common"
)

type ChatNotFoundError struct {
	ChatID domain.ChatID
}

func (e *ChatNotFoundError) Error() string {
	return fmt.Sprintf("no chat with id '%s'", e.ChatID)
}

func (e *ChatNotFoundError) Code() string {
	return "ERR_CHAT_NOT_FOUND"
}

func (e *ChatNotFoundError) Details() common.Encodable {
	return encodables.NewDebugEncodable().Add("chatId", e.ChatID)
}

func NewChatNotFoundError(chatID domain.ChatID) *ChatNotFoundError {
	return &ChatNotFoundError{ChatID: chatID}
}
