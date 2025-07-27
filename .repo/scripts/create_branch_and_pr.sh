#!/bin/bash

BRANCH="ai/task-$(date +%s)"
git checkout -b $BRANCH
git add .
git commit -m "AI: auto-update for task"
git push --set-upstream origin $BRANCH

# Create a PR
gh pr create --title "AI-generated: $1" --body "$2" --head "$BRANCH"
