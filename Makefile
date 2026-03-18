.PHONY: build down logs ps up stop restart clean

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

stop:
	docker compose stop

restart: down up

clean:
	docker compose down -v --remove-orphans

dev: up logs