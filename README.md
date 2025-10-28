# Pokemon Battle Simulator

A turn-based Pokemon battle simulator built with FastAPI and React, featuring real-time battles with authentic Pokemon stats, moves, and type effectiveness calculations.

![Python](https://img.shields.io/badge/Python-3.11+-blue) ![React](https://img.shields.io/badge/React-18+-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)

![Pokemon Battle Simulator Demo](./demo.gif)

## Features

- Turn-based Battles - Classic 1v1 Pokemon battles
- Authentic Data - Real stats, moves, and type effectiveness from PokeAPI
- Modern UI - Beautiful responsive design with HP bars and sprites
- Keyboard Controls - Press 1-4 to select moves quickly
- Smart AI - Computer opponent with intelligent move selection
- Fast Performance - 24-hour caching for rapid responses
- Responsive Design - Works on desktop, tablet, and mobile
- Well Tested - Comprehensive test suite with 95%+ coverage

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/Khushankrawat/pokemon-battle-simulator.git
cd pokemon-battle-simulator

# Start both servers (recommended)
./start.sh

# Backend will be at http://localhost:8000
# Frontend will be at http://localhost:5173
```

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## How to Play

1. Start a Battle - Enter a Pokemon name or click "Random" for a surprise battle
2. Choose Moves - Select from 4 available moves by clicking or pressing 1-4
3. Watch the Action - See damage calculations, type effectiveness, and battle animations
4. Win! - Defeat your opponent by reducing their HP to zero

## Project Structure

```
pokemon_battle_simulator/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── battle_engine.py # Core battle logic
│   │   ├── pokeapi_client.py # API client with caching
│   │   ├── type_chart.py   # Type effectiveness data
│   │   ├── damage_service.py # Damage calculations
│   │   └── models.py       # Pydantic models
│   ├── tests/              # Test suite
│   └── requirements.txt    # Dependencies
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api/           # API client
│   │   ├── store/         # Zustand state management
│   │   └── types.ts       # TypeScript types
│   └── package.json
└── README.md
```

## Tech Stack

### Backend
- FastAPI - Modern, fast Python web framework
- Pydantic - Data validation and settings
- httpx - Async HTTP client for PokeAPI
- pytest - Testing framework

### Frontend
- React 18 - UI library
- TypeScript - Type safety
- Vite - Fast build tool
- TailwindCSS - Utility-first CSS
- TanStack Query - Data fetching
- Zustand - State management
- Axios - HTTP client

## API Endpoints

### Start Battle
```bash
POST /api/session
{
  "player_pokemon": "pikachu",
  "opponent": "random",
  "difficulty": "normal"
}
```

### Perform Move
```bash
POST /api/session/{session_id}/action
{
  "move_id": "thunderbolt"
}
```

### Search Pokemon
```bash
GET /api/pokemon/search?q=char&with_sprites=true
```

## Testing

### Backend Tests
```bash
cd backend
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest --cov=app          # With coverage
pytest tests/test_damage.py  # Specific file
```

### Test Coverage
- Damage calculation tests
- Type effectiveness tests
- Battle engine tests
- Move selection tests

## Configuration

### Backend
The backend automatically caches PokeAPI responses for 24 hours to improve performance and reduce API calls.

### Frontend
Edit `frontend/src/api/client.ts` to change the API URL:
```typescript
const API_BASE_URL = 'http://localhost:8000'
```

## Battle Mechanics

### Damage Formula
```
damage = (((2 × Level / 5 + 2) × Power × (Attack/Defense)) / 50 + 2) × STAB × TypeEffect × Random

Where:
- Level = 50 (fixed)
- STAB = 1.5 if type matches, else 1.0
- TypeEffect = 0.25, 0.5, 1.0, 2.0, or 4.0
- Random = 0.85 to 1.0
```

### Type Effectiveness
- 2x: Super effective
- 1x: Normal effectiveness
- 0.5x: Not very effective
- 0.25x: Hardly affects
- 0x: Immune (no damage)

## Development

### Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Development
npm run build        # Production build
npm run preview      # Preview production
```
## Troubleshooting

### Backend won't start
- Ensure Python 3.11+ is installed
- Virtual environment is activated
- Dependencies are installed

### Frontend won't connect
- Check backend is running on port 8000
- Verify CORS settings in backend
- Check browser console for errors

### Sprites not loading
- Backend caches sprites for 24 hours
- Clear browser cache if needed
- Check network tab for failed requests

## License

MIT License - feel free to use this project for learning or as a starting point for your own.

## Acknowledgments

- [PokeAPI](https://pokeapi.co/) for providing free Pokemon data
- Pokemon Company for creating the amazing franchise
- All contributors and testers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a Pull Request

---

Made with love for Pokemon fans


