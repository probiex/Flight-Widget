#!/bin/bash
# scripts/trigger_agent.sh
while true; do
    echo "Running agent loop..."
    python ai-agent/agent.py
    sleep 3600  # run every hour
done
