package cmdutils

import "fmt"

func Ensure(e error) {
	if e != nil {
		fmt.Printf("error: %s (%#v)\n", e.Error(), e)
		panic(e)
	}
}

func Require[T any](result T, e error) T {
	if e != nil {
		fmt.Printf("error: %s (%#v)\n", e.Error(), e)
		panic(e)
	}
	return result
}
