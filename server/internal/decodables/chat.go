package decodables

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

func DecodeChatPostCommand(cmd *domain.DispatcherCommand) (*domain.PostChatMessageData, common.Error) {
	var payload api.ChatPostCommandPayload
	err := json.Unmarshal(cmd.Payload, &payload)

	if err != nil {
		return nil, newDecodeError(err)
	}

	return &domain.PostChatMessageData{
		ChatID:  domain.ChatID(payload.ChatID),
		Author:  cmd.OnBehalf,
		Content: payload.Content,
	}, nil
}

func DecodeChatHistoryCommand(cmd *domain.DispatcherCommand) (*domain.ChatHistoryFilter, common.Error) {
	var payload api.ChatHistoryCommandPayload
	err := json.Unmarshal(cmd.Payload, &payload)

	if err != nil {
		return nil, newDecodeError(err)
	}

	return &domain.ChatHistoryFilter{
		ChatID:       domain.ChatID(payload.ChatID),
		PostedBefore: payload.PostedBefore,
		Limit:        payload.Limit,
	}, nil
}
