package main

import (
	"fmt"
	"os"
	"srv/internal/config"
	"srv/internal/srv"
)

func main() {
	statics := os.Getenv("SRV_STATIC")
	if statics == "" {
		statics = "../ui/dist"
	}

	err := srv.Run(&config.SrvConfig{
		Port:                "8031",
		StaticFilesLocation: statics,
	})
	if err != nil {
		fmt.Printf("Error: %s\n", err.Error())
		os.Exit(1)
	}
}
