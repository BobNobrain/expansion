package domain

type OpaqueBlob struct {
	ID      string
	Format  string
	Version int32
	Data    []byte
}
