package globals

import (
	"srv/internal/globals/assets"
	"srv/internal/globals/config"
	"srv/internal/globals/events"
	"srv/internal/globals/globaldata"
	"srv/internal/globals/logger"
)

func Init() {
	config.Init()
	logger.Init()
	assets.Init()
	globaldata.Init()
	events.Init()
}
