package components

import "time"

type Updateable interface {
	Update()
}

type Updater interface {
	Start()
	Stop()

	ScheduleUpdateAt(Updateable, time.Time)
	ScheduleUpdateAfter(Updateable, time.Duration)
}
