#!/bin/bash

echo "Starting..."

while true; do
    node index.js
    echo "Restarting..."
    sleep 3
done
