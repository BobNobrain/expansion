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

type DictEncodable struct {
	props map[string]any
}

func NewDictEncodable() *DictEncodable {
	return &DictEncodable{
		props: make(map[string]any),
	}
}

func (dict *DictEncodable) Encode() interface{} {
	return dict.props
}

func (dict *DictEncodable) Set(prop string, value any) *DictEncodable {
	dict.props[prop] = value
	return dict
}

type Decodable interface {
	Decode(interface{}) error
}
