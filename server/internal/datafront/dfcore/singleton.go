package dfcore

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
	"sync"
)

type QueryableSingletonFrontend interface {
	Query(dfapi.DFSingletonRequest, DFRequestContext) (common.Encodable, common.Error)
	Unsubscribe(domain.ClientID)
	Attach(*DataFront, DFPath)
	Dispose()
}

type QueryableSingletonController interface {
	PublishUpdate(update common.Encodable)
}

type QueryableSingleton interface {
	QueryableSingletonFrontend
	QueryableSingletonController
}

type queryableSingletonImpl struct {
	df   *DataFront
	path DFPath

	lock *sync.RWMutex
	subs map[domain.ClientID]bool
	ds   func(DFRequestContext) (common.Encodable, common.Error)
}

func NewQueryableSingleton(dataSource func(DFRequestContext) (common.Encodable, common.Error)) QueryableSingleton {
	return &queryableSingletonImpl{
		lock: new(sync.RWMutex),
		subs: make(map[domain.ClientID]bool),
		ds:   dataSource,
	}
}

func (s *queryableSingletonImpl) Attach(df *DataFront, path DFPath) {
	s.df = df
	s.path = path
}

func (s *queryableSingletonImpl) Dispose() {}

func (s *queryableSingletonImpl) Query(
	req dfapi.DFSingletonRequest,
	ctx DFRequestContext,
) (common.Encodable, common.Error) {
	if !req.JustBrowsing {
		s.lock.Lock()
		defer s.lock.Unlock()

		s.subs[ctx.ClientID] = true
	}

	return s.ds(ctx)
}

func (s *queryableSingletonImpl) Unsubscribe(cid domain.ClientID) {
	s.lock.Lock()
	defer s.lock.Unlock()

	delete(s.subs, cid)
}

func (s *queryableSingletonImpl) PublishUpdate(update common.Encodable) {
	s.lock.RLock()
	defer s.lock.RUnlock()

	clients := make([]domain.ClientID, 0, len(s.subs))
	for ci := range s.subs {
		clients = append(clients, ci)
	}

	s.df.updatesQueue.pushSingleton(dfapi.DFSingletonUpdatePatch{
		Path:   s.path.String(),
		Update: update.Encode(),
	}, clients)
}
