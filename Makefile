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

.PHONY: dev-server
dev-srv:
	cd server && SRV_STATIC="http://localhost:3000" make watch

.PHONY: dev-desktop
dev-desktop:
	cd ui && npm run serve:desktop

.PHONY: rebuild-and-run
rebuild-and-run: api-types build-desktop run-server
