CAESAR = node ./tools/caesar.js

#
# generated files
#
.PHONY: setup api-types assetgen
setup:
	@echo "Setting up the project for local development"
	cd server && make setup && make setup-dev-db
	cd ../ui && npm i
	cd ../tools && npm i

api-types:
	cd server && make api-types

#
# dev servers
#
.PHONY: dev-server dev-desktop-ui dev-touch-ui dev-desktop dev-touch
dev-srv:
	cd server && SRV_STATIC="http://localhost:3000" make watch

dev-desktop-ui:
	cd ui && npm run serve:desktop

dev-touch-ui:
	cd ui && npm run serve:touch

dev-desktop:
	$(CAESAR) client: make dev-desktop-ui server: make dev-srv

dev-touch:
	$(CAESAR) client: make dev-touch-ui server: make dev-srv

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

dev-db-schema:
	cd server && ARGS='-action=schema' make dev-db

dev-db-galaxy:
	cd server && ARGS='-action=galaxy' make dev-db

dev-db-users:
	cd server && ARGS='-action=users' make dev-db
