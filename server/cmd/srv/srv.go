package main

import (
	"fmt"
	"os"
	"srv/internal/config"
	"srv/internal/srv"
)

func main() {
	config, err := config.Get()

	if err != nil {
		fmt.Printf("Cannot get config: %s\n", err.Error())
		os.Exit(2)
	}

	err = srv.Run(config)

	if err != nil {
		fmt.Printf("Error: %s\n", err.Error())
		os.Exit(1)
	}
}
