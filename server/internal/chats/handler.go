package chats

import (
	"srv/internal/dispatcher"
	"srv/internal/domain"
	"srv/internal/encodables"
	"srv/internal/utils/ajson"
	"srv/internal/utils/common"
)

const scope = domain.DispatcherScope("chat")

func (impl *chatRepoImpl) AsDispatcherCommandHandler() domain.DispatcherCommandHandler {
	return impl
}

func (impl *chatRepoImpl) GetScope() domain.DispatcherScope {
	return scope
}

func (impl *chatRepoImpl) HandleCommand(cmd *domain.DispatcherCommand) (common.Encodable, common.Error) {
	switch cmd.Command {
	case "post":
		chatId, err := ajson.GetPrimitive[string](cmd.Payload, []string{"chatId"})
		if err != nil {
			return nil, err
		}
		content, err := ajson.GetPrimitive[string](cmd.Payload, []string{"content"})
		if err != nil {
			return nil, err
		}

		_, err = impl.PostMessage(domain.PostChatMessageData{
			ChatID:  domain.ChatID(chatId),
			Author:  cmd.OnBehalf,
			Content: content,
		})

		if err != nil {
			return nil, err
		}

		return encodables.NewEmptyOkResponse(), nil

	case "list":
		chats, err := impl.ListChatsForUser(cmd.OnBehalf)
		if err != nil {
			return nil, err
		}

		return encodables.NewChatListResponse(chats), nil
	}

	return nil, dispatcher.NewUnknownDispatcherCommandError(cmd)
}
