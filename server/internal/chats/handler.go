package chats

import (
	"srv/internal/decodables"
	"srv/internal/dispatcher"
	"srv/internal/domain"
	"srv/internal/encodables"
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
		parsedPayload, err := decodables.DecodeChatPostCommand(cmd)
		if err != nil {
			return nil, err
		}

		_, err = impl.PostMessage(parsedPayload)

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

	case "history":
		filter, err := decodables.DecodeChatHistoryCommand(cmd)
		if err != nil {
			return nil, err
		}

		history, err := impl.ListChatMessages(filter)
		if err != nil {
			return nil, err
		}

		return encodables.NewChatHistoryResponse(history), nil
	}

	return nil, dispatcher.NewUnknownDispatcherCommandError(cmd)
}
