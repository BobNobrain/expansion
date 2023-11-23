export PATH := $(shell go env GOPATH)/bin:$(PATH)

.PHONY: run
run:
	go run cmd/srv/srv.go

.PHONY: watch
watch:
	gow run cmd/srv/srv.go

.PHONY: api-types
api-types:
	tygo generate
