CAESAR = node ./tools/caesar.js

#
# generated files
#
.PHONY: setup api-types sqlc
setup: dev-db
	@echo "Setting up the project for local development"
	cd server && make setup setup-dev-db
	cd ui && npm i && npm run build:editor
	cd tools && npm i

api-types:
	cd server && make api-types

sqlc:
	cd server && make sqlc

#
# dev servers
#
.PHONY: dev-server dev-desktop-ui dev-touch-ui dev-desktop dev-touch dev-editor-api dev-editor-ui
dev-srv:
	cd server && SRV_STATIC="http://localhost:3000" make watch

dev-editor-api:
	cd server && SRV_STATIC="http://localhost:3000" make watch-editor

dev-desktop-ui:
	cd ui && npm run serve:desktop

dev-touch-ui:
	cd ui && npm run serve:touch

dev-editor-ui:
	cd ui && npm run serve:editor

dev-desktop:
	$(CAESAR) client: make dev-desktop-ui server: make dev-srv

dev-touch:
	$(CAESAR) client: make dev-touch-ui server: make dev-srv

dev-editor:
	$(CAESAR) client: make dev-editor-ui server: make dev-editor-api

editor:
	cd server && make editor-api

#
# db
#
.PHONY: dev-db dev-db-schema dev-db-galaxy dev-db-users
dev-db:
	docker run \
		--name expansion-dev-db \
		-e POSTGRES_USER=devsrv \
		-e POSTGRES_PASSWORD=dev \
		-e POSTGRES_DB=expansion \
		-p 5012:5432 \
		-d postgres:16.2-alpine

	DB_CONTAINER=expansion-dev-db DB_USER=devsrv ./tools/db/wait.sh

dev-db-schema:
	cd server && ARGS='-action=schema' make dev-db

dev-db-galaxy:
	cd server && ARGS='-action=galaxy' make dev-db

dev-db-users:
	cd server && ARGS='-action=users' make dev-db
