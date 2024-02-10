package domain

type Permastore interface {
	GetCollection() *PermastoreCollection
}

type PermastoreCollection interface{}
