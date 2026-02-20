#!/bin/bash

echo "🦷 Dental Clinic Assistant - Setup Script"
echo "=========================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ is required. You have $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Build shared package
echo "🔨 Building shared package..."
npm run build:shared
if [ $? -ne 0 ]; then
    echo "❌ Failed to build shared package"
    exit 1
fi
echo "✅ Shared package built"
echo ""

# Check for backend .env
if [ ! -f "packages/backend/.env" ]; then
    echo "⚠️  Backend .env file not found"
    echo "📝 Creating from .env.example..."
    cp packages/backend/.env.example packages/backend/.env
    echo "⚠️  IMPORTANT: Edit packages/backend/.env with your credentials:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - JWT_SECRET (generate a secure random string)"
    echo "   - GEMINI_API_KEY (from https://makersuite.google.com/app/apikey)"
    echo ""
fi

# Check for frontend .env
if [ ! -f "packages/frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found"
    echo "📝 Creating from .env.example..."
    cp packages/frontend/.env.example packages/frontend/.env
    echo "✅ Frontend .env created (default: http://localhost:8080)"
    echo ""
fi

echo "=========================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit packages/backend/.env (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY)"
echo "   - Edit packages/frontend/.env (VITE_API_BASE_URL)"
echo ""
echo "2. Set up the database:"
echo "   npm run migrate --workspace=packages/backend"
echo ""
echo "3. Start development servers:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "Default login: admin@dentalclinic.com / admin123"
echo ""
echo "=========================================="
