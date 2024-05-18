package updater_test

import (
	"srv/internal/components/updater"
	"sync"
	"testing"
	"time"
)

type testUpdateable struct {
	lock   *sync.Mutex
	done   bool
	doneAt time.Time
}

func newTestUpdateable() *testUpdateable {
	return &testUpdateable{
		lock: &sync.Mutex{},
		done: false,
	}
}

func (u *testUpdateable) Update() {
	now := time.Now()
	u.lock.Lock()
	defer u.lock.Unlock()

	u.done = true
	u.doneAt = now
}

func (u *testUpdateable) isDone() bool {
	u.lock.Lock()
	defer u.lock.Unlock()
	return u.done
}

func (u *testUpdateable) getDoneAt() time.Time {
	u.lock.Lock()
	defer u.lock.Unlock()
	return u.doneAt
}

func TestUpdaterUpdates(t *testing.T) {
	upd := updater.NewUpdater()
	upd.Start()

	u1 := newTestUpdateable()
	u2 := newTestUpdateable()
	now := time.Now()

	upd.ScheduleUpdateAfter(u1, 100*time.Millisecond)
	upd.ScheduleUpdateAfter(u2, 50*time.Millisecond)

	time.Sleep(200 * time.Millisecond)

	if !u1.isDone() {
		t.Error("u1 is not done")
	}
	if !u2.isDone() {
		t.Error("u2 is not done")
	}

	actualU1Delay := u1.getDoneAt().Sub(now)
	if actualU1Delay < 100*time.Millisecond {
		t.Errorf("u1 was updated too soon (in %d ms instead of 100)", actualU1Delay/time.Millisecond)
	}

	actualU2Delay := u2.getDoneAt().Sub(now)
	if actualU2Delay < 50*time.Millisecond {
		t.Errorf("u2 was updated too soon (in %d ms instead of 50)", actualU2Delay/time.Millisecond)
	}

	upd.Stop()
}

func TestUpdaterStops(t *testing.T) {
	upd := updater.NewUpdater()
	upd.Start()

	u1 := newTestUpdateable()
	u2 := newTestUpdateable()

	upd.ScheduleUpdateAfter(u1, 100*time.Millisecond)
	upd.ScheduleUpdateAfter(u2, 50*time.Millisecond)

	time.Sleep(70 * time.Millisecond)

	upd.Stop()

	time.Sleep(100 * time.Millisecond)

	if u1.isDone() {
		t.Error("u1 is done")
	}
	if !u2.isDone() {
		t.Error("u2 is not done")
	}
}
