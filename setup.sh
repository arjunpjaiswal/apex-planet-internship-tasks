#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " ApexPlanet - Frontend Internship Portfolio Setup Script  "
echo "=========================================================="

# Create folder structure
mkdir -p .github/workflows
mkdir -p .storybook
mkdir -p docs
mkdir -p e2e
mkdir -p public/icons
mkdir -p src/components
mkdir -p src/observability
mkdir -p stories
mkdir -p tasks
mkdir -p tests

echo "Directory hierarchy verified."

# Install dependencies if package.json is present
if [ -f "package.json" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo "Setup completed successfully. Run 'npm run dev' to start the development server."
