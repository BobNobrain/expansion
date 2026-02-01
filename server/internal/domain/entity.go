package domain

import "srv/internal/utils/common"

type EntityID string

type EntityDescriptor[Entity any] interface {
	IdentifyEntity(Entity) EntityID
	EncodeEntity(Entity) common.Encodable
}

type EntityAccessController[Entity any] interface {
	ViewFor(Entity, RequestContext) *Entity
}

type EntityCollection interface {
	ApplyAccessControl(RequestContext)
	AsEncodableMap() common.Encodable
	GetIDs() []EntityID
	GetEncodedEntity(EntityID) common.Encodable
}

type EntityCollectionBuilder[Entity any] interface {
	EntityCollection

	Add(Entity) EntityCollectionBuilder[Entity]
	AddList([]Entity) EntityCollectionBuilder[Entity]
	AddMap(map[EntityID]Entity) EntityCollectionBuilder[Entity]

	Clone() EntityCollectionBuilder[Entity]
}

func MakeUnorderedEntityCollection[Entity any](
	descriptor EntityDescriptor[Entity],
	accessController EntityAccessController[Entity],
) EntityCollectionBuilder[Entity] {
	if descriptor == nil {
		panic("descriptor is required for entity collection to work")
	}

	return unorderedEntityCollectionImpl[Entity]{
		descriptor:       descriptor,
		accessController: accessController,
		entities:         make(map[EntityID]Entity),
	}
}

type unorderedEntityCollectionImpl[Entity any] struct {
	descriptor       EntityDescriptor[Entity]
	accessController EntityAccessController[Entity]
	entities         map[EntityID]Entity
}

func (u unorderedEntityCollectionImpl[Entity]) Add(e Entity) EntityCollectionBuilder[Entity] {
	id := u.descriptor.IdentifyEntity(e)
	u.entities[id] = e
	return u
}

func (u unorderedEntityCollectionImpl[Entity]) AddList(es []Entity) EntityCollectionBuilder[Entity] {
	for _, e := range es {
		u.Add(e)
	}
	return u
}

func (u unorderedEntityCollectionImpl[Entity]) AddMap(em map[EntityID]Entity) EntityCollectionBuilder[Entity] {
	for _, e := range em {
		u.Add(e)
	}
	return u
}

func (u unorderedEntityCollectionImpl[Entity]) Clone() EntityCollectionBuilder[Entity] {
	clonedEntities := make(map[EntityID]Entity, len(u.entities))
	for eid, e := range u.entities {
		clonedEntities[eid] = e
	}

	return unorderedEntityCollectionImpl[Entity]{
		descriptor:       u.descriptor,
		accessController: u.accessController,
		entities:         clonedEntities,
	}
}

func (u unorderedEntityCollectionImpl[Entity]) GetIDs() []EntityID {
	result := make([]EntityID, 0, len(u.entities))
	for id := range u.entities {
		result = append(result, id)
	}
	return result
}

func (u unorderedEntityCollectionImpl[Entity]) GetEncodedEntity(eid EntityID) common.Encodable {
	return u.descriptor.EncodeEntity(u.entities[eid])
}

func (u unorderedEntityCollectionImpl[Entity]) AsEncodableMap() common.Encodable {
	return u
}

func (u unorderedEntityCollectionImpl[Entity]) ApplyAccessControl(req RequestContext) {
	if u.accessController == nil {
		return
	}

	for eid, e := range u.entities {
		view := u.accessController.ViewFor(e, req)

		if view == nil {
			delete(u.entities, eid)
			continue
		}

		u.entities[eid] = *view
	}
}

func (u unorderedEntityCollectionImpl[Entity]) Encode() any {
	result := make(map[string]any, len(u.entities))

	for eid, e := range u.entities {
		result[string(eid)] = u.descriptor.EncodeEntity(e).Encode()
	}

	return result
}
