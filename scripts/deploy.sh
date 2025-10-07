#!/bin/bash

# Nam Long Center - Auto Deploy Script
# This script automates the deployment process

echo "🚀 Starting Nam Long Center Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Run linting
print_status "Running ESLint..."
npm run lint

if [ $? -ne 0 ]; then
    print_warning "ESLint found issues, but continuing..."
fi

# Step 3: Build the project
print_status "Building project..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

# Step 4: Check build output
if [ ! -d "build" ]; then
    print_error "Build directory not found"
    exit 1
fi

print_status "Build completed successfully!"

# Step 5: Display build info
echo ""
echo "📊 Build Information:"
echo "===================="
echo "Build directory: $(du -sh build | cut -f1)"
echo "Main bundle: $(find build/static/js -name "main.*.js" -exec du -sh {} \; | head -1)"
echo "CSS bundle: $(find build/static/css -name "main.*.css" -exec du -sh {} \; | head -1)"

# Step 6: Check for environment variables
echo ""
echo "🔧 Environment Check:"
echo "===================="

if [ -f ".env" ]; then
    print_status "Environment file found"
else
    print_warning "No .env file found. Please create one from .env.example"
fi

# Step 7: Deployment instructions
echo ""
echo "🚀 Deployment Instructions:"
echo "=========================="
echo "1. Upload the 'build' folder to your hosting provider"
echo "2. Configure environment variables on your hosting platform"
echo "3. Set up your domain and SSL certificate"
echo "4. Test the application thoroughly"

# Step 8: Vercel deployment (if vercel CLI is available)
if command -v vercel &> /dev/null; then
    echo ""
    echo "🌐 Vercel CLI detected. Would you like to deploy to Vercel? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Deploying to Vercel..."
        vercel --prod
    fi
else
    print_warning "Vercel CLI not found. Install it with: npm i -g vercel"
fi

echo ""
print_status "Deployment script completed!"
echo "Build is ready in the 'build' directory."
