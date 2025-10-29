#!/bin/bash

# Friendly Docker Compose Startup Script with Colored Logging
# Shows which services are running and on which ports

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BOLD}${CYAN}🐳 Docker Compose Startup${NC}"
    echo -e "${CYAN}================================${NC}"
}

print_service_status() {
    local service_name=$1
    local port=$2
    local status=$3
    local url=$4

    if [ "$status" == "running" ]; then
        echo -e "${GREEN}✅ ${service_name}${NC} - ${BOLD}Running${NC}"
        echo -e "   📍 Port: ${BLUE}${port}${NC}"
        if [ ! -z "$url" ]; then
            echo -e "   🔗 URL: ${CYAN}${url}${NC}"
        fi
    else
        echo -e "${RED}❌ ${service_name}${NC} - ${BOLD}Stopped/Error${NC}"
    fi
    echo ""
}

check_service_health() {
    local service_name=$1
    local health_url=$2

    if curl -s -f "$health_url" > /dev/null 2>&1; then
        return 0  # Healthy
    else
        return 1  # Unhealthy
    fi
}

wait_for_services() {
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    echo ""

    # Wait for frontend (check if port 3000 is responsive)
    for i in {1..30}; do
        if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${YELLOW}⚠️  Frontend might still be starting...${NC}"
        fi
        sleep 2
    done

    # Wait for backend (check if port 8000 is responsive)
    for i in {1..30}; do
        if curl -s -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${YELLOW}⚠️  Backend might still be starting...${NC}"
        fi
        sleep 2
    done
}

show_service_info() {
    echo -e "${BOLD}${PURPLE}📋 Service Information${NC}"
    echo -e "${PURPLE}====================${NC}"
    echo ""

    # Check if services are running and get their info
    if docker-compose ps | grep -q "frontend.*Up"; then
        print_service_status "Frontend (Next.js)" "3000" "running" "http://localhost:3000"
    else
        print_service_status "Frontend (Next.js)" "3000" "stopped"
    fi

    if docker-compose ps | grep -q "backend.*Up"; then
        print_service_status "Backend (FastAPI)" "8000" "running" "http://localhost:8000"
        echo -e "   📚 API Docs: ${CYAN}http://localhost:8000/docs${NC}"
    else
        print_service_status "Backend (FastAPI)" "8000" "stopped"
    fi

    echo -e "${BOLD}${BLUE}🌐 Access Points${NC}"
    echo -e "${BLUE}================${NC}"
    echo -e "🏠 Main Site:     ${CYAN}http://localhost:3000${NC}"
    echo -e "🔧 Backend API:   ${CYAN}http://localhost:8000${NC}"
    echo -e "📖 API Docs:      ${CYAN}http://localhost:8000/docs${NC}"
    echo ""
}

show_useful_commands() {
    echo -e "${BOLD}${YELLOW}💡 Useful Commands${NC}"
    echo -e "${YELLOW}==================${NC}"
    echo -e "📊 View logs:      ${CYAN}docker-compose logs -f${NC}"
    echo -e "🛑 Stop services:  ${CYAN}docker-compose down${NC}"
    echo -e "🔄 Restart:        ${CYAN}docker-compose restart${NC}"
    echo -e "📋 Status:         ${CYAN}docker-compose ps${NC}"
    echo -e "🧹 Clean up:       ${CYAN}docker-compose down -v${NC}"
    echo ""
}

# Main execution
main() {
    print_header

    # Determine which compose file to use
    COMPOSE_FILE="docker-compose.yml"
    if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
        COMPOSE_FILE="docker-compose.dev.yml"
        echo -e "${YELLOW}🔧 Using development configuration${NC}"
        echo ""
    fi

    echo -e "${BLUE}🚀 Starting services with ${COMPOSE_FILE}${NC}"
    echo ""

    # Start docker-compose in background
    docker-compose -f "$COMPOSE_FILE" up -d

    # Wait a moment for containers to initialize
    sleep 3

    # Show service information
    show_service_info

    # Wait for services to be ready (optional)
    if [ "$2" != "--no-wait" ]; then
        wait_for_services
    fi

    # Show final status
    echo -e "${BOLD}${GREEN}🎉 Startup Complete!${NC}"
    echo ""

    show_useful_commands

    echo -e "${CYAN}📝 To follow logs in real-time, run:${NC}"
    echo -e "${BOLD}docker-compose -f $COMPOSE_FILE logs -f${NC}"
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}⚠️  Startup interrupted${NC}"; exit 1' INT

# Run main function with all arguments
main "$@"