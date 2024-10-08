package main

import (
	"os"
	"os/signal"
	"srv/internal/editor"
	"srv/internal/globals"
	"srv/internal/globals/logger"
	"syscall"
)

func main() {
	globals.Init()

	m := editor.New()

	go trapSignals(m)

	err := m.Start()

	if err != nil {
		logger.Fatal(logger.FromUnknownError("main", err))
		os.Exit(1)
	}
}

func trapSignals(m *editor.EditorAPI) {
	cancelChan := make(chan os.Signal, 1)
	// catch SIGETRM or SIGINTERRUPT
	signal.Notify(cancelChan, syscall.SIGTERM, syscall.SIGINT)

	s := <-cancelChan
	logger.Info(logger.FromMessage("main", "Received a signal").WithDetail("sig", s))
	m.Stop()
	os.Exit(0)
}
