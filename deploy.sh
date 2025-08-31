#!/bin/bash

# TicketingSystem Deployment Script
# This script automates the deployment process for both development and production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Function to check if required files exist
check_files() {
    local missing_files=()
    
    if [ ! -f "docker-compose.yml" ]; then
        missing_files+=("docker-compose.yml")
    fi
    
    if [ ! -f "env.docker" ]; then
        missing_files+=("env.docker")
    fi
    
    if [ ! -f "docker/laravel/Dockerfile" ]; then
        missing_files+=("docker/laravel/Dockerfile")
    fi
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        print_error "Missing required files: ${missing_files[*]}"
        exit 1
    fi
    
    print_success "All required files are present"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f ".env" ]; then
        cp env.docker .env
        print_success "Created .env file from env.docker"
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Function to build containers
build_containers() {
    print_status "Building Docker containers..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml build
        print_success "Production containers built successfully"
    else
        docker-compose build
        print_success "Development containers built successfully"
    fi
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml up -d
        print_success "Production services started successfully"
    else
        docker-compose up -d
        print_success "Development services started successfully"
    fi
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    while ! docker-compose exec -T postgres pg_isready -U ticketing_user -d ticketing_system > /dev/null 2>&1; do
        sleep 2
    done
    print_success "PostgreSQL is ready"
    
    # Wait for Laravel
    print_status "Waiting for Laravel..."
    while ! docker-compose exec -T laravel php artisan route:list > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Laravel is ready"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml exec -T laravel php artisan migrate --force
        docker-compose -f docker-compose.prod.yml exec -T laravel php artisan db:seed --force
    else
        docker-compose exec -T laravel php artisan migrate
        docker-compose exec -T laravel php artisan db:seed
    fi
    
    print_success "Database migrations completed"
}

# Function to optimize for production
optimize_production() {
    if [ "$1" = "production" ]; then
        print_status "Optimizing for production..."
        
        docker-compose -f docker-compose.prod.yml exec -T laravel php artisan config:cache
        docker-compose -f docker-compose.prod.yml exec -T laravel php artisan route:cache
        docker-compose -f docker-compose.prod.yml exec -T laravel php artisan view:cache
        
        print_success "Production optimization completed"
    fi
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    local compose_file="docker-compose.yml"
    if [ "$1" = "production" ]; then
        compose_file="docker-compose.prod.yml"
    fi
    
    # Check if all containers are running
    if docker-compose -f $compose_file ps | grep -q "Exit"; then
        print_error "Some containers are not running properly"
        docker-compose -f $compose_file ps
        exit 1
    fi
    
    print_success "All services are healthy"
}

# Function to display access information
display_info() {
    print_success "Deployment completed successfully!"
    echo
    echo "Access Information:"
    echo "=================="
    
    if [ "$1" = "production" ]; then
        echo "Main Application: http://your-domain.com"
        echo "API Documentation: http://your-domain.com/api/documentation"
        echo "Admin Panel: http://your-domain.com/admin"
    else
        echo "Main Application: http://localhost"
        echo "API Documentation: http://localhost:8000/api/documentation"
        echo "Admin Panel: http://localhost:4000"
        echo "Laravel API: http://localhost:8000"
    fi
    
    echo
    echo "Useful Commands:"
    echo "================"
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
    echo "Restart services: docker-compose restart"
    echo "Check status: docker-compose ps"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -e, --environment ENV    Deployment environment (dev|prod) [default: dev]"
    echo "  -h, --help               Show this help message"
    echo
    echo "Examples:"
    echo "  $0                      # Deploy development environment"
    echo "  $0 -e prod             # Deploy production environment"
    echo "  $0 --environment dev   # Deploy development environment"
}

# Main deployment function
deploy() {
    local environment=${1:-dev}
    
    print_status "Starting TicketingSystem deployment ($environment environment)..."
    
    # Check prerequisites
    check_docker
    check_files
    
    # Setup environment
    setup_environment
    
    # Build and start services
    build_containers $environment
    start_services $environment
    
    # Wait for services
    wait_for_services
    
    # Run migrations
    run_migrations $environment
    
    # Optimize for production
    optimize_production $environment
    
    # Check health
    check_health $environment
    
    # Display information
    display_info $environment
}

# Parse command line arguments
ENVIRONMENT="dev"

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    print_error "Invalid environment: $ENVIRONMENT. Use 'dev' or 'prod'"
    exit 1
fi

# Run deployment
deploy $ENVIRONMENT
