# Quick Start Guide

## 🚀 Getting Started

This project requires Python 3.11+ and Node.js 18+.

### 1. Start the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend will be available at: **http://localhost:8000**

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

### 3. Or Use the Scripts

```bash
# Make scripts executable
chmod +x start-backend.sh start-frontend.sh start.sh

# Start both services
./start.sh

# Or individually
./start-backend.sh   # Backend only
./start-frontend.sh  # Frontend only
```

## 🎮 How to Play

1. Open **http://localhost:5173** in your browser
2. Type a Pokémon name (or click "Random") to start a battle
3. Use the move buttons or press keys **1-4** to attack
4. Watch the battle unfold with real damage calculations!

## 📋 Available Pokémon

Try these popular choices:
- **pikachu**
- **charizard**
- **blastoise**
- **venusaur**
- **garchomp**
- **lucario**
- **snorlax**

Or click "Random" for a surprise!

## ⚙️ Project Structure

```
pokemon_battle_simulator/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── main.py              # API endpoints
│   │   ├── battle_engine.py     # Battle logic
│   │   ├── damage_service.py    # Damage calculations
│   │   ├── pokeapi_client.py    # PokéAPI integration
│   │   └── models.py             # Data models
│   └── tests/                    # Test suite
│
├── frontend/         # React frontend
│   └── src/
│       ├── components/          # UI components
│       ├── api/                 # API client
│       ├── store/               # State management
│       └── types.ts             # TypeScript types
│
└── README.md         # Full documentation
```

## 🧪 Running Tests

```bash
cd backend
pytest
```

## 🐛 Troubleshooting

### Backend won't start
- Make sure Python 3.11+ is installed
- Check that venv is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Frontend won't start
- Make sure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check that backend is running on port 8000

### No Pokémon found
- Check your internet connection (uses PokéAPI)
- Try popular Pokémon names like "pikachu" or "charizard"
- Use the "Random" button

## 📚 Next Steps

- Read the full README.md for API details
- Check out backend/tests for example test cases
- Modify battle logic in backend/app/battle_engine.py
- Customize UI in frontend/src/components/

---

**Happy Battling! 🎉**

