#!/bin/bash

# Script to create GitHub repository and push sample application

set -e

REPO_NAME="cicd-sample-app"
GITHUB_USER="mavuwam"

echo "========================================="
echo "GitHub Repository Setup"
echo "========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    echo "✓ Git initialized"
else
    echo "✓ Git already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
node_modules/
.DS_Store
*.log
.env
.aws-sam/
packaged.yaml
EOF
    echo "✓ Created .gitignore"
fi

# Add all files
echo ""
echo "Adding files to git..."
git add .
echo "✓ Files added"

# Commit
echo ""
echo "Creating initial commit..."
git commit -m "Initial commit: Sample CI/CD application" || echo "Nothing to commit or already committed"
echo "✓ Commit created"

# Instructions for creating GitHub repo
echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""
echo "Since GitHub CLI is not available, please create the repository manually:"
echo ""
echo "Option 1: Using GitHub Web Interface"
echo "  1. Go to: https://github.com/new"
echo "  2. Repository name: $REPO_NAME"
echo "  3. Description: Sample application for CI/CD pipeline"
echo "  4. Choose Public or Private"
echo "  5. Do NOT initialize with README (we already have files)"
echo "  6. Click 'Create repository'"
echo ""
echo "Option 2: Using curl (if you have a GitHub token)"
echo "  curl -H \"Authorization: token YOUR_GITHUB_TOKEN\" \\"
echo "       -d '{\"name\":\"$REPO_NAME\",\"description\":\"Sample CI/CD app\"}' \\"
echo "       https://api.github.com/user/repos"
echo ""
echo "After creating the repository, run these commands:"
echo ""
echo "  git branch -M main"
echo "  git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "  git push -u origin main"
echo ""
echo "Your repository URL will be: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "For the pipeline configuration, use: $GITHUB_USER/$REPO_NAME"
echo ""
