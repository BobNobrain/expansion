export PATH := $(shell go env GOPATH)/bin:$(PATH)

.PHONY: run
run:
	go run cmd/srv/srv.go

.PHONY: watch
watch:
	gow -r=false run cmd/srv/srv.go

.PHONY: api-types
api-types:
	tygo generate

.PHONY: assetgen
assetgen:
	go run cmd/assetgen/assetgen.go

.PHONY: dev-db
dev-db:
	go run cmd/devdb/devdb.go $(ARGS)
