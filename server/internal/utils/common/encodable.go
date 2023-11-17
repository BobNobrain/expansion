package common

type Encodable interface {
	Encode() interface{}
}

type Decodable interface {
	Decode(interface{}) error
}
