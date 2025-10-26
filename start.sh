#!/bin/bash
echo "Starting Pokémon Battle Simulator..."
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
./start-backend.sh &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
./start-frontend.sh &
FRONTEND_PID=$!

# Wait for both
wait $BACKEND_PID $FRONTEND_PID

