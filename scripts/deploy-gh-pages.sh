#!/bin/bash
set -e

# Configuration
DEPLOY_BRANCH="gh-pages"
SOURCE_BRANCH="trunk"

echo "Starting deployment to ${DEPLOY_BRANCH}..."

# 1. Ensure we're on the source branch
git checkout ${SOURCE_BRANCH}

# 2. Build the app
echo "Building app..."
npm run build

# 3. Create or reset the deployment branch
echo "Switching to ${DEPLOY_BRANCH} branch..."
git checkout -B ${DEPLOY_BRANCH}

# 4. Clean up everything but .git and dist
echo "Cleaning up current directory..."
# Use git rm to remove all tracked files
git rm -rf .

# 5. Move build artifacts to root
echo "Staging build artifacts..."
# Since dist was ignored, it's still there after git rm
mv dist/* .
rm -rf dist

# 6. Stage and commit
echo "Committing deployment artifacts..."
git add -A
git commit -m "Deploy to GitHub Pages at $(date)"

# 7. Push gh-pages to origin
echo "Pushing ${DEPLOY_BRANCH} to origin..."
git push origin ${DEPLOY_BRANCH} --force

# 8. Switch back to source branch
echo "Switching back to ${SOURCE_BRANCH}..."
git checkout ${SOURCE_BRANCH}

echo "Deployment complete!"
