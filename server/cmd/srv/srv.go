package main

import (
	"fmt"
	"os"
	"srv/internal/srv"
)

func main() {
	err := srv.Run()
	if err != nil {
		fmt.Printf("Error: %s\n", err.Error())
		os.Exit(1)
	}
}
