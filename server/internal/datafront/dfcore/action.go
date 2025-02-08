package dfcore

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
	"sync"
	"time"
)

type Action[T any] struct {
	lock   *sync.Mutex
	tokens map[string]time.Time
	runner func(T, domain.UserID) (common.Encodable, common.Error)
}

type ActionFrontend interface {
	Run(dfapi.DFActionRequest, domain.UserID) (common.Encodable, common.Error)
	CleanUp()
	Dispose()
}

func NewAction[T any](runner func(T, domain.UserID) (common.Encodable, common.Error)) *Action[T] {
	return &Action[T]{
		lock:   new(sync.Mutex),
		tokens: make(map[string]time.Time),
		runner: runner,
	}
}

func (a *Action[T]) CleanUp() {
	const maxLifetime = 15 * time.Minute

	a.lock.Lock()
	defer a.lock.Unlock()

	now := time.Now()

	for token, created := range a.tokens {
		if now.Sub(created) > maxLifetime {
			delete(a.tokens, token)
		}
	}
}

func (a *Action[T]) Run(action dfapi.DFActionRequest, onBehalf domain.UserID) (common.Encodable, common.Error) {
	var payload T
	err := json.Unmarshal(action.Payload, &payload)
	if err != nil {
		return nil, common.NewDecodingError(err)
	}

	a.lock.Lock()
	defer a.lock.Unlock()

	_, found := a.tokens[action.IdempotencyToken]
	if found {
		return nil, common.NewError(
			common.WithCode("ERR_IDEMPOTENCY"),
			common.WithMessage("this action has already been registered"),
		)
	}

	return a.runner(payload, onBehalf)
}

func (a *Action[T]) Dispose() {
	a.lock.Lock()
	defer a.lock.Unlock()
	a.tokens = make(map[string]time.Time)
}

func (df *DataFront) runTokensCleanup() {
	timer := time.NewTicker(time.Minute * 2)

	for {
		select {
		case <-df.actionsCleanupStopper:
			timer.Stop()
			return

		case <-timer.C:
			df.lock.RLock()
			defer df.lock.RUnlock()

			for _, action := range df.actions {
				action.CleanUp()
			}
		}
	}
}
