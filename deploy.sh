#!/bin/bash

# Polar's Shack Deployment Script
set -e

echo "🚀 Deploying Polar's Shack..."

# Configuration
DOMAIN=${DOMAIN:-"localhost"}
PROXY_PORT=${PROXY_PORT:-3001}
WEB_PORT=${WEB_PORT:-80}
SSL_ENABLED=${SSL_ENABLED:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check requirements
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Requirements check passed ✓"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create necessary directories
    mkdir -p logs nginx/ssl
    
    # Set permissions
    chmod +x proxy-server/start.sh
    
    # Create environment file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
NODE_ENV=production
PORT=${PROXY_PORT}
DOMAIN=${DOMAIN}
SSL_ENABLED=${SSL_ENABLED}
EOF
        print_status "Created .env file"
    fi
    
    print_status "Environment setup complete ✓"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop existing services
    docker-compose -f docker-compose.production.yml down 2>/dev/null || true
    
    # Build and start services
    docker-compose -f docker-compose.production.yml up -d --build
    
    print_status "Services started ✓"
}

# Health checks
health_checks() {
    print_status "Performing health checks..."
    
    # Wait for services to start
    sleep 10
    
    # Check proxy server
    if curl -f http://localhost:${PROXY_PORT}/health &> /dev/null; then
        print_status "Proxy server is healthy ✓"
    else
        print_error "Proxy server health check failed"
        return 1
    fi
    
    # Check web server
    if curl -f http://localhost:${WEB_PORT} &> /dev/null; then
        print_status "Web server is healthy ✓"
    else
        print_error "Web server health check failed"
        return 1
    fi
    
    print_status "All health checks passed ✓"
}

# Setup SSL (optional)
setup_ssl() {
    if [ "$SSL_ENABLED" = "true" ]; then
        print_status "Setting up SSL..."
        
        if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
            print_warning "SSL certificates not found. Generating self-signed certificates..."
            
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout nginx/ssl/key.pem \
                -out nginx/ssl/cert.pem \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}"
            
            print_status "Self-signed SSL certificates generated"
        fi
        
        # Enable HTTPS in nginx config
        sed -i 's/# server {/server {/g' nginx/nginx.conf
        sed -i 's/# }/}/g' nginx/nginx.conf
        
        print_status "SSL setup complete ✓"
    fi
}

# Display deployment info
show_deployment_info() {
    print_status "Deployment complete! 🎉"
    echo
    echo "📊 Service URLs:"
    echo "   Web Interface: http://${DOMAIN}:${WEB_PORT}"
    echo "   Proxy Server:  http://${DOMAIN}:${PROXY_PORT}"
    echo "   Admin Panel:   http://${DOMAIN}:${WEB_PORT}/admin.html"
    echo "   Health Check:  http://${DOMAIN}:${PROXY_PORT}/health"
    echo
    echo "🔧 Management Commands:"
    echo "   View logs:     docker-compose -f docker-compose.production.yml logs -f"
    echo "   Stop services: docker-compose -f docker-compose.production.yml down"
    echo "   Restart:       docker-compose -f docker-compose.production.yml restart"
    echo
    echo "🔐 Security Notes:"
    echo "   - Change admin password in admin.html"
    echo "   - Configure firewall rules"
    echo "   - Set up proper SSL certificates for production"
    echo "   - Restrict admin panel access by IP"
    echo
}

# Main deployment flow
main() {
    echo "🌟 Polar's Shack Deployment Script"
    echo "=================================="
    echo
    
    check_requirements
    setup_environment
    setup_ssl
    deploy_services
    
    if health_checks; then
        show_deployment_info
    else
        print_error "Deployment failed during health checks"
        print_status "Checking logs..."
        docker-compose -f docker-compose.production.yml logs --tail=50
        exit 1
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        print_status "Stopping services..."
        docker-compose -f docker-compose.production.yml down
        print_status "Services stopped ✓"
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose -f docker-compose.production.yml restart
        print_status "Services restarted ✓"
        ;;
    "logs")
        docker-compose -f docker-compose.production.yml logs -f
        ;;
    "status")
        docker-compose -f docker-compose.production.yml ps
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|logs|status}"
        exit 1
        ;;
esac
