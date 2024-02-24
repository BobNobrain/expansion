CAESAR = node ./tools/caesar.js

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

.PHONY: dev-desktop-ui
dev-desktop-ui:
	cd ui && npm run serve:desktop

.PHONY: dev-touch-ui
dev-touch-ui:
	cd ui && npm run serve:touch

.PHONY: rebuild-and-run
rebuild-and-run: api-types build-desktop run-server

.PHONY: dev-desktop
dev-desktop:
	$(CAESAR) client: make dev-desktop-ui server: make dev-srv

.PHONY: dev-touch
dev-touch:
	$(CAESAR) client: make dev-touch-ui server: make dev-srv
