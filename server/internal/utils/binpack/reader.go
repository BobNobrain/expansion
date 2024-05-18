package binpack

import (
	"bytes"
	"encoding/binary"
	"encoding/gob"
)

type Reader struct {
	stream    *bytes.Reader
	byteOrder binary.ByteOrder
	err       error
}

func NewReaderFromBytes(data []byte) *Reader {
	return &Reader{
		stream:    bytes.NewReader(data),
		byteOrder: binary.LittleEndian,
		err:       nil,
	}
}

func (r *Reader) GetError() error {
	return r.err
}

func (r *Reader) ReadUVarInt() uint64 {
	if r.err != nil {
		return 0
	}

	val, err := binary.ReadUvarint(r.stream)
	r.err = err
	return val
}

func Read[T any](r *Reader) T {
	var val T
	if r.err != nil {
		return val
	}

	d := gob.NewDecoder(r.stream)

	r.err = d.Decode(&val)
	// r.err = binary.Read(r.stream, r.byteOrder, &val)
	return val
}
