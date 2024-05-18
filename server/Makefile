export PATH := $(shell go env GOPATH)/bin:$(PATH)

.PHONY: run
run:
	go run cmd/monolith/monolith.go

.PHONY: watch
watch:
	gow -r=false run cmd/monolith/monolith.go

.PHONY: setup
setup: api-types assetgen galaxy-texture
	go install github.com/gzuidhof/tygo@latest
	go install github.com/mitranim/gow@latest

.PHONY: api-types
api-types:
	tygo generate

.PHONY: assetgen
assetgen:
	go run cmd/assetgen/assetgen.go

.PHONY: galaxy-texture
galaxy-texture:
	mkdir -p ../ui/assets/tx
	go run cmd/galaxytex/galaxytex.go -size=512
	go run cmd/galaxytex/galaxytex.go -size=256
	go run cmd/galaxytex/galaxytex.go -size=128

.PHONY: dev-db
dev-db:
	go run cmd/devdb/devdb.go $(ARGS)

.PHONY: setup-dev-db
setup-dev-db:
	go run cmd/devdb/devdb.go -action=schema
	go run cmd/devdb/devdb.go -action=users
	go run cmd/devdb/devdb.go -action=galaxy
