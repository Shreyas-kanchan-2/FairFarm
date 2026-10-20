# FairFarm 

> Direct Market Access Platform for Marginal Farmers

FairFarm removes predatory middlemen by connecting smallholder growers directly with retailers, hotels, and wholesalers. It features automated NetProfit offer ranking, shared transport pooling, and multilingual voice access.

---

##  Features

- **NetProfit Engine**: Calculates and ranks real net earnings after factoring in transport, transit damage, and handling costs, protecting farmers from deceptive nominal pricing.
- **Shared Transport Pooling**: Aggregates nearby farmer shipments headed in similar directions to drastically cut logistics expenses.
- **Multilingual & Voice-Enabled**: Supports English, Hindi, and Kannada with voice interactions tailored for accessibility.
- **Direct Buyer Matching**: Connects farmers directly with verified local restaurants, hotels, and retailers.

---

## Project Architecture

```
FairFarm/
├── frontend/          # React + Vite + Tailwind CSS + Lucide Icons
├── backend/           # FastAPI backend with NetProfit calculations & Voice AI integrations
├── supabase/          # Database schemas and migrations
├── .env.example       # Environment configuration template
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (v3.10+)
- **Supabase Account / CLI**

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Environment Variables

Copy `.env.example` to `.env` in both `frontend` and `backend` (or project root as configured) and provide the required API keys (Supabase, ElevenLabs, etc.).

---

## License

This project is licensed under the MIT License.
