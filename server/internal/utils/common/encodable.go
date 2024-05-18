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

type dictEncodable struct {
	props map[string]any
}

func DictEncodable() *dictEncodable {
	return &dictEncodable{
		props: make(map[string]any),
	}
}

func (dict *dictEncodable) Encode() interface{} {
	return dict.props
}

func (dict *dictEncodable) Set(prop string, value any) *dictEncodable {
	dict.props[prop] = value
	return dict
}

type Decodable interface {
	Decode(interface{}) error
}
