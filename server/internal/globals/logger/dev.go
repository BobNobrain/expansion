package logger

import (
	"fmt"
	"os"
	"sync"
)

type devLoggerTransport struct {
	// We need to be able to write into a transport from any thread we want,
	// therefore we need to syncronize all this calls.
	lock *sync.Mutex
}

const reset = "\033[0m"

// const red = "\033[31m"
// const greenBold = "\033[32;1m"
// const magenta = "\033[35m"
// const cyan = "\033[36m"
// const gray = "\033[37m"
// const white = "\033[97m"
const redBold = "\033[31;1m"
const green = "\033[32m"
const yellow = "\033[33m"
const blue = "\033[34m"
const magentaBold = "\033[35;1m"

func paint(text string, color string) string {
	return fmt.Sprintf("%s%s%s", color, text, reset)
}

var levelNames = map[logLevel]string{
	logLevelDebug: paint("DEBUG", green),
	logLevelInfo:  paint("INFO", blue),
	logLevelWarn:  paint("WARN", yellow),
	logLevelError: paint("ERROR", redBold),
	logLevelFatal: paint("FATAL", magentaBold),
}

// Log implements logTransport.
func (l *devLoggerTransport) Log(level logLevel, entry *LogEntry) {
	into := os.Stdout
	if level >= logLevelWarn {
		into = os.Stderr
	}

	l.lock.Lock()
	defer l.lock.Unlock()

	if entry.Error != nil {
		fmt.Fprintf(into, "[%s] %s: %+v\n", levelNames[level], entry.Source, entry.Error)
	} else {
		fmt.Fprintf(into, "[%s] %s: %s\n", levelNames[level], entry.Source, entry.Message)
	}

	if len(entry.Details) > 0 {
		for name, value := range entry.Details {
			fmt.Fprintf(into, "    - %s: %+v\n", name, value)
		}
	}
}

func newDevLoggerTrasport() logTransport {
	return &devLoggerTransport{
		lock: new(sync.Mutex),
	}
}
