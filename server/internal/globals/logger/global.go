package logger

import (
	"os"
	"strings"
)

var globalLogger loggerImpl

func Init() {
	// TODO: check the environment and create a production logger if in production

	globalLogger = loggerImpl{
		transport:          newDevLoggerTrasport(),
		minLevel:           logLevelInfo,
		minLevelsPerSource: make(map[string]logLevel),
	}

	envLogLevel := os.Getenv("EXPANSION_LOG_LEVEL")
	switch strings.ToLower(envLogLevel) {
	case "debug":
		globalLogger.minLevel = logLevelDebug

	case "warn":
		globalLogger.minLevel = logLevelWarn

	case "error":
		globalLogger.minLevel = logLevelError
	}

	debugOverrides := strings.Split(os.Getenv("EXPANSION_DEBUG"), ",")
	for _, override := range debugOverrides {
		source := strings.Trim(override, " ")
		globalLogger.minLevelsPerSource[source] = logLevelDebug
	}
}

func Fatal(e *LogEntry) {
	globalLogger.log(logLevelFatal, e)
}

func Error(e *LogEntry) {
	globalLogger.log(logLevelError, e)
}

func Warn(e *LogEntry) {
	globalLogger.log(logLevelWarn, e)
}

func Info(e *LogEntry) {
	globalLogger.log(logLevelInfo, e)
}

func Debug(e *LogEntry) {
	globalLogger.log(logLevelDebug, e)
}
