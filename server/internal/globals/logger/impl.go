package logger

type logLevel byte

const (
	logLevelDebug logLevel = 1
	logLevelInfo  logLevel = 2
	logLevelWarn  logLevel = 3
	logLevelError logLevel = 4
	logLevelFatal logLevel = 5
)

type logTransport interface {
	Log(level logLevel, entry *LogEntry)
}

// No syncronization here, as we do not expect any of these fields to change
// after logger is initialized.
// However, they are needed in transports, so parallel logger calls do not race.
type loggerImpl struct {
	transport          logTransport
	minLevelsPerSource map[string]logLevel
	minLevel           logLevel
}

func (l *loggerImpl) log(level logLevel, entry *LogEntry) {
	minLevel, specified := l.minLevelsPerSource[entry.Source]
	if !specified {
		minLevel = l.minLevel
	}
	if level < minLevel {
		return
	}

	l.transport.Log(level, entry)
}
