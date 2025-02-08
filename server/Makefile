export PATH := $(shell go env GOPATH)/bin:$(PATH)

.PHONY: run
run:
	go run cmd/monolith/monolith.go

.PHONY: watch
watch:
	gow -r=false run cmd/monolith/monolith.go

.PHONY: editor-api
editor-api:
	go run cmd/editor-api/editor-api.go

.PHONY: watch-editor
watch-editor:
	gow -r=false run cmd/editor-api/editor-api.go

.PHONY: setup install
setup: install codegen assetgen galaxy-texture

install:
	go install github.com/gzuidhof/tygo@latest
	go install github.com/mitranim/gow@latest

.PHONY: assetgen
assetgen:
	go run cmd/assetgen/assetgen.go

.PHONY: galaxy-texture
galaxy-texture:
	mkdir -p ../ui/assets/tx
	go run cmd/galaxytex/galaxytex.go -size=512
	go run cmd/galaxytex/galaxytex.go -size=256
	go run cmd/galaxytex/galaxytex.go -size=128

.PHONY: setup-dev-db db-tables generate-galaxy fixtures
setup-dev-db: db-tables generate-galaxy fixtures

db-tables:
	cat ./db/schema/*.sql | docker exec -i expansion-dev-db psql postgresql://devsrv:dev@localhost:5432/expansion

generate-galaxy:
	go run cmd/generate-galaxy/generate-galaxy.go

fixtures:
	go run cmd/fixtures/fixtures.go

.PHONY: planetgen
planetgen:
	EXPANSION_DEBUG=planetgen go run cmd/planetgendebug/planetgendebug.go

.PHONY: codegen api-types sqlc
codegen: api-types sqlc

api-types:
	tygo generate

.PHONY: sqlc
sqlc:
	sqlc generate
