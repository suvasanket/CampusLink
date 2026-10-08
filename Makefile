# ==============================================================================
# CampusLink — Master Automation Makefile
# Unified Full-Stack Command Interface
# ==============================================================================

.DEFAULT_GOAL := start

.PHONY: start dev backend frontend test seed setup build clean help

# Colors
CYAN  := \033[36m
GREEN := \033[32m
RESET := \033[0m
BOLD  := \033[1m

## start: Boot the entire CampusLink platform (Backend + Frontend) concurrently with auto-port freeing and graceful Ctrl+C teardown (DEFAULT)
start: dev

## dev: Alias for 'start'
dev:
	@./scripts/dev.sh

## backend: Run only the FastAPI backend server on http://localhost:8000
backend:
	@echo "$(CYAN)$(BOLD)Starting CampusLink FastAPI Backend...$(RESET)"
	@backend/venv/bin/uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload

## frontend: Run only the Vite + React frontend portal on http://localhost:5173
frontend:
	@echo "$(CYAN)$(BOLD)Starting CampusLink Three-Portal Frontend...$(RESET)"
	@npm run dev --prefix frontend

## test: Run complete automated test suite (backend pytest + frontend type check & build)
test:
	@echo "$(CYAN)$(BOLD)Running Backend Pytest Suite (14 Tests)...$(RESET)"
	@backend/venv/bin/pytest backend/tests/ -v
	@echo ""
	@echo "$(CYAN)$(BOLD)Verifying Frontend Production Build & TypeScript Types...$(RESET)"
	@npm run build --prefix frontend
	@echo "$(GREEN)$(BOLD)✓ All backend tests passed and frontend bundle compiled successfully!$(RESET)"

## seed: Seed / re-populate the database with 32 students and 6 corporate jobs
seed:
	@echo "$(CYAN)$(BOLD)Seeding database with benchmark student profiles & jobs...$(RESET)"
	@backend/venv/bin/python backend/seed_db.py
	@echo "$(GREEN)$(BOLD)✓ Database successfully seeded.$(RESET)"

## setup: Install all backend Python dependencies and frontend NPM packages
setup:
	@echo "$(CYAN)$(BOLD)Setting up Python environment...$(RESET)"
	@python3 -m venv backend/venv
	@backend/venv/bin/pip install --upgrade pip
	@backend/venv/bin/pip install -r backend/requirements.txt
	@echo "$(CYAN)$(BOLD)Installing Frontend NPM packages...$(RESET)"
	@npm install --prefix frontend
	@echo "$(GREEN)$(BOLD)✓ Dependencies installed successfully.$(RESET)"

## build: Build production bundle for frontend in frontend/dist/
build:
	@npm run build --prefix frontend

## clean: Remove build artifacts, cached models, and python bytecode
clean:
	@echo "$(CYAN)$(BOLD)Cleaning temporary caches and build artifacts...$(RESET)"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@rm -rf frontend/dist 2>/dev/null || true
	@echo "$(GREEN)$(BOLD)✓ Clean complete.$(RESET)"

## help: Show this command menu
help:
	@echo "$(CYAN)$(BOLD)========================================================$(RESET)"
	@echo "$(CYAN)$(BOLD)             CAMPUSLINK MAKEFILE COMMANDS               $(RESET)"
	@echo "$(CYAN)$(BOLD)========================================================$(RESET)"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed -e 's/## //' | awk 'BEGIN {FS = ": "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""
