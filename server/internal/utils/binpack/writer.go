package binpack

import (
	"bytes"
	"encoding/binary"
	"encoding/gob"
	"io"
)

type Writer struct {
	stream    io.Writer
	byteOrder binary.ByteOrder
	err       error
}

func NewWriter(buf *bytes.Buffer) *Writer {
	return &Writer{
		stream:    buf,
		byteOrder: binary.LittleEndian,
		err:       nil,
	}
}

func (w *Writer) GetError() error {
	return w.err
}

func (w *Writer) WriteUVarInt(value uint64) {
	if w.err != nil {
		return
	}

	bytes := binary.AppendUvarint([]byte{}, value)
	_, err := w.stream.Write(bytes)
	w.err = err
}

func Write[T any](w *Writer, value T) {
	if w.err != nil {
		return
	}

	enc := gob.NewEncoder(w.stream)
	w.err = enc.Encode(value)

	// w.err = binary.Write(w.stream, w.byteOrder, value)
}
