#!/bin/bash

# Plant Price System Deployment Script
# This script helps deploy both frontend and backend

echo "🌱 Plant Price System Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "All requirements are satisfied."
}

# Deploy Backend to Railway
deploy_backend() {
    print_status "Preparing backend for Railway deployment..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI is not installed."
        print_status "Please install Railway CLI: npm install -g @railway/cli"
        print_status "Then run: railway login"
        print_status "And run: railway link"
        return 1
    fi
    
    # Deploy to Railway
    print_status "Deploying backend to Railway..."
    railway up --detach
    
    # Get the deployed URL
    BACKEND_URL=$(railway domain)
    print_status "Backend deployed at: $BACKEND_URL"
    
    cd ..
    return 0
}

# Deploy Frontend to Vercel
deploy_frontend() {
    print_status "Preparing frontend for Vercel deployment..."
    
    cd plant-price-system
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build the project
    print_status "Building frontend..."
    npm run build
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI is not installed."
        print_status "Please install Vercel CLI: npm install -g vercel"
        print_status "Then run: vercel login"
        return 1
    fi
    
    # Deploy to Vercel
    print_status "Deploying frontend to Vercel..."
    vercel --prod
    
    cd ..
    return 0
}

# Main deployment function
main() {
    echo ""
    print_status "Starting deployment process..."
    echo ""
    
    # Check requirements
    check_requirements
    
    # Deploy backend
    print_status "Step 1: Deploying Backend to Railway"
    echo "----------------------------------------"
    if deploy_backend; then
        print_status "✅ Backend deployment completed successfully!"
    else
        print_error "❌ Backend deployment failed!"
        exit 1
    fi
    
    echo ""
    
    # Deploy frontend
    print_status "Step 2: Deploying Frontend to Vercel"
    echo "----------------------------------------"
    if deploy_frontend; then
        print_status "✅ Frontend deployment completed successfully!"
    else
        print_error "❌ Frontend deployment failed!"
        exit 1
    fi
    
    echo ""
    print_status "🎉 Deployment completed successfully!"
    print_status "Don't forget to:"
    print_status "1. Set environment variables in Railway dashboard"
    print_status "2. Set environment variables in Vercel dashboard"
    print_status "3. Update REACT_APP_API_URL with your Railway backend URL"
}

# Run main function
main "$@"
