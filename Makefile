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
	cd server && make run

.PHONY: api-types
api-types:
	cd server && make api-types

.PHONY: rebuild-and-run
rebuild-and-run: api-types build-desktop run-server
