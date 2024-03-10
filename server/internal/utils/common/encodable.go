package common

type Encodable interface {
	Encode() interface{}
}

type emptyEncodable struct{}

func (*emptyEncodable) Encode() interface{} {
	return nil
}

func EmptyEncodable() Encodable {
	return &emptyEncodable{}
}

type customEncodable struct {
	value any
}

func (e *customEncodable) Encode() interface{} {
	return e.value
}

func AsEncodable(anything any) Encodable {
	return &customEncodable{value: anything}
}

type Decodable interface {
	Decode(interface{}) error
}
