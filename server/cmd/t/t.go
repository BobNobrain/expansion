package main

import (
	"encoding/json"
	"fmt"
	"os"
	"srv/internal/utils/ajson"
)

type jTest struct {
	X int         `json:"x"`
	Y interface{} `json:"y"`
}

func main() {
	jsonBytes := []byte("{ \"x\": 1, \"y\": {\"x\": \"2\", \"y\": [3, \"s\", {}]} }")
	var parsed jTest

	err := json.Unmarshal(jsonBytes, &parsed)
	if err != nil {
		fmt.Printf("unparsed: %v", err)
		os.Exit(1)
	}

	fmt.Printf("parsed: %v\n", parsed)

	val, err := ajson.GetPrimitive[float64](parsed.Y, []string{"y", "0"})
	if err != nil {
		fmt.Printf("err: %v\n", err)
	} else {
		fmt.Printf("%v\n", val)
	}
}
