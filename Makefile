.PHONY: build-desktop
build-desktop:
	cd ui && npm run build:desktop

.PHONY: build-editor
build-editor:
	cd ui && npm run build:editor

.PHONY: run-editor
run-editor:
	echo TBD...

.PHONY: run-server
run-server:
	cd server && go run cmd/srv/srv.go

.PHONY: rebuild-and-run
rebuild-and-run: build-desktop run-server
