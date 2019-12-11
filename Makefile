.PHONY: all
all: up start

.PHONY: install
install: up node_modules

.PHONY: start
start:
	docker-compose exec node sh -c "npm start"

.PHONY: stop
stop:
	docker-compose down

.PHONY: up
up:
	docker-compose up -d

.PHONY: test
test:
	docker-compose exec node sh -c "npm test"

.PHONY: logs
logs:
	docker-compose logs -ft

.PHONY: bash
bash:
	docker-compose exec node sh

node_modules:
	docker-compose exec node sh -c "npm install"