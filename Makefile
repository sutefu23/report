# Development Commands
.PHONY: install dev dev-frontend dev-backend test test-e2e lint format typecheck clean

install:
	npm install
	npm run test:install

dev:
	npm run dev

dev-frontend:
	npm run dev:frontend

dev-backend:
	npm run dev:backend

# Testing Commands
test:
	npm test

test-e2e:
	npm run test:e2e

test-e2e-ui:
	npm run test:e2e:ui

# Code Quality Commands
lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

typecheck:
	npm run typecheck

# Database Commands
db-migrate:
	npm run db:migrate

db-studio:
	npm run db:studio

db-seed:
	npm run db:seed

db-reset:
	npm run db:reset

db-refresh:
	npm run db:reset
	npm run db:seed

# Build Commands
build:
	npm run build

build-shared:
	npm run build:shared

build-frontend:
	npm run build:frontend

build-backend:
	npm run build:backend

# Docker Commands
up:
	docker compose -f config/docker/docker-compose.yml up -d

down:
	docker compose -f config/docker/docker-compose.yml down

docker-build:
	docker compose -f config/docker/docker-compose.yml build

logs:
	docker compose -f config/docker/docker-compose.yml logs -f

# UI Component Management
ui:
	npm run ui

# Protocol Buffer Generation
proto:
	npm run proto:generate

# Cleanup
clean:
	rm -rf node_modules
	rm -rf src/front/node_modules
	rm -rf src/backend/node_modules
	rm -rf src/shared/node_modules
	rm -rf src/front/.next
	rm -rf src/backend/dist
	rm -rf src/shared/dist