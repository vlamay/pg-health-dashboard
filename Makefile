.PHONY: up down dev demo logs test lint build help

help:
	@echo "PostgreSQL Health Monitor - Available commands:"
	@echo ""
	@echo "  make up          - Start all services (production)"
	@echo "  make down        - Stop and remove all services"
	@echo "  make dev         - Start services with hot-reload (development)"
	@echo "  make demo        - Generate demo data with blocking scenario"
	@echo "  make logs        - Follow logs from backend and frontend"
	@echo "  make test        - Run backend tests"
	@echo "  make lint        - Run linting (backend)"
	@echo "  make build       - Build Docker images"
	@echo ""

up:
	@echo "Starting PostgreSQL Health Monitor..."
	docker compose up -d --build

down:
	@echo "Stopping PostgreSQL Health Monitor..."
	docker compose down -v

dev:
	@echo "Starting in development mode (with hot-reload)..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

demo: up
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Generating demo data..."
	docker compose exec backend python -m app.seed

logs:
	docker compose logs -f backend frontend

test:
	@echo "Running backend tests..."
	docker compose run --rm -e DATABASE_URL="postgresql://pghealth:pghealth@postgres:5432/pghealth" backend pytest tests/ -v

lint:
	@echo "Linting backend..."
	docker compose run --rm backend ruff check app/

build:
	@echo "Building Docker images..."
	docker compose build

.DEFAULT_GOAL := help
