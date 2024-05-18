package updater

import (
	"srv/internal/components"
	"srv/internal/utils"
	"sync"
	"time"
)

type updaterTask struct {
	at         time.Time
	updateable components.Updateable
}

type updater struct {
	lock *sync.Mutex

	active bool

	stopSignals []chan bool
}

func NewUpdater() components.Updater {
	return &updater{
		lock:        &sync.Mutex{},
		active:      false,
		stopSignals: make([]chan bool, 0),
	}
}

func (u *updater) Start() {
	u.lock.Lock()
	defer u.lock.Unlock()

	u.active = true
}

func (u *updater) Stop() {
	u.lock.Lock()
	defer u.lock.Unlock()

	for _, next := range u.stopSignals {
		next <- true
	}
	u.stopSignals = make([]chan bool, 0)
	u.active = false
}

func (u *updater) ScheduleUpdateAt(what components.Updateable, when time.Time) {
	go u.schedule(&updaterTask{
		at:         when,
		updateable: what,
	})
}

func (u *updater) ScheduleUpdateAfter(what components.Updateable, after time.Duration) {
	go u.schedule(&updaterTask{
		at:         time.Now().Add(after),
		updateable: what,
	})
}

func (u *updater) allocateStopSignal() chan bool {
	u.lock.Lock()
	defer u.lock.Unlock()

	stop := make(chan bool)
	u.stopSignals = append(u.stopSignals, stop)
	return stop
}
func (u *updater) releaseStopSignal(signal chan bool) {
	u.lock.Lock()
	defer u.lock.Unlock()

	u.stopSignals = utils.FastRemove(u.stopSignals, signal)
	close(signal)
}

func (u *updater) schedule(task *updaterTask) {
	stop := u.allocateStopSignal()
	defer u.releaseStopSignal(stop)

	timer := time.NewTimer(time.Until(task.at))

	select {
	case <-timer.C:
		task.updateable.Update()

	case <-stop:
		timer.Stop()
	}
}
