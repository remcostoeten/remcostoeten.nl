#!/bin/bash

# Docker Compose with Friendly Logging
# Run this instead of 'docker-compose up' to see colored service status

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print service status
print_startup_banner() {
    echo -e "${BOLD}${CYAN}🐳 Starting Docker Services${NC}"
    echo -e "${CYAN}==========================${NC}"
    echo ""

    # Detect which compose file is being used
    if [[ "$*" == *"-f docker-compose.dev.yml"* ]] || [[ "$*" == *"dev"* ]]; then
        echo -e "${YELLOW}🔧 Development Mode${NC}"
        MODE="Development"
    else
        echo -e "${GREEN}🚀 Production Mode${NC}"
        MODE="Production"
    fi
    echo ""
}

print_service_info() {
    echo -e "${BOLD}${PURPLE}📋 Services Starting...${NC}"
    echo -e "${PURPLE}======================${NC}"
    echo ""

    echo -e "${BLUE}🌐 Frontend (Next.js)${NC}"
    echo -e "   📍 Port: ${BOLD}3000${NC}"
    echo -e "   🔗 URL: ${CYAN}http://localhost:3000${NC}"
    echo ""

    echo -e "${BLUE}🔧 Backend (FastAPI)${NC}"
    echo -e "   📍 Port: ${BOLD}8000${NC}"
    echo -e "   🔗 URL: ${CYAN}http://localhost:8000${NC}"
    echo -e "   📚 API Docs: ${CYAN}http://localhost:8000/docs${NC}"
    echo ""

    echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
    echo ""
}

monitor_services() {
    # Start monitoring in background
    (
        sleep 5
        echo ""
        echo -e "${BOLD}${GREEN}✅ Services Status Check${NC}"
        echo -e "${GREEN}========================${NC}"

        # Check frontend
        if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend: ${BOLD}READY${NC} ${CYAN}http://localhost:3000${NC}"
        else
            echo -e "${YELLOW}⏳ Frontend: ${BOLD}STARTING...${NC}"
        fi

        # Check backend
        if curl -s -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend: ${BOLD}READY${NC} ${CYAN}http://localhost:8000${NC}"
        else
            echo -e "${YELLOW}⏳ Backend: ${BOLD}STARTING...${NC}"
        fi

        echo ""
        echo -e "${CYAN}💡 Tip: Use 'docker-compose ps' to see detailed status${NC}"
        echo ""
    ) &
}

# Main execution
print_startup_banner "$@"
print_service_info

# Start monitoring in background
monitor_services

# Run docker-compose with all passed arguments
echo -e "${BOLD}🚀 Running: docker-compose $@${NC}"
echo ""

# Execute docker-compose with original arguments
exec docker-compose "$@"