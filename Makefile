MIN_MAKE_VERSION := 3.82
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
GOOGLE_KEY_PATH ?= $(ROOT_DIR)/auth.json

ifneq ($(MIN_MAKE_VERSION),$(firstword $(sort $(MAKE_VERSION) $(MIN_MAKE_VERSION))))
	$(error GNU Make $(MIN_MAKE_VERSION) or higher required)
endif

.DEFAULT_GOAL:=help

##@ Targets
.PHONY: check-env build build-app run run-dev lint test help

prep:
	@mkdir -p node_modules vendor
	touch db.sqlite
	cp -n config/config.example.yml config/config.yml

build-dev: prep ## Build the dev image
	docker build -t weather-tts --target develop .

build-prod: prep ## Build the prod image
	docker build -t weather-tts --target production .

run: build-prod ## Runs the container
	xdg-open http://localhost:5000 || open https://localhost:5000 || true && \
	docker run --rm -ti \
	--device /dev/snd \
	--mount source=$(GOOGLE_KEY_PATH),type=bind,target=/usr/src/app/auth.json \
	--name weather-tts \
	--publish 5000:5000 \
	--volume $(ROOT_DIR)/config/config.yml:/usr/src/app/config/config.yml \
	--volume $(ROOT_DIR)/db.sqlite:/usr/src/app/db.sqlite \
	weather-tts

run-dev: build-dev ## Runs the container with hot reload
	docker run --rm -ti \
	--device /dev/snd \
	--mount source=$(GOOGLE_KEY_PATH),type=bind,target=/usr/src/app/auth.json \
	--name weather-tts \
	--publish 5000:5000 \
	--volume $(ROOT_DIR)/config/config.yml:/usr/src/app/config/config.yml \
	--volume $(ROOT_DIR)/db.sqlite:/usr/src/app/db.sqlite \
	--volume $(ROOT_DIR)/src:/usr/src/app/src \
	--volume $(ROOT_DIR)/test:/usr/src/app/test \
	--volume $(ROOT_DIR)/views:/usr/src/app/views \
	--volume $(ROOT_DIR)/node_modules:/usr/src/app/node_modules \
	weather-tts

lint: ## Runs eslint
	docker run --rm -e \
	CI=true \
	weather-tts \
	npm run lint

test: ## Runs mocha tests
	docker run --rm -e \
	CI=true \
	weather-tts \
	npm run test

cli: ## Open the container with bash
	docker exec -ti weather-tts /bin/bash

help:
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
