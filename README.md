# Job Aggregator

A job aggregation portal with a React frontend and a FastAPI backend. It scrapes job openings from the Adzuna API, stores them in Supabase, and emails custom job alerts to users using the Resend API.

## Project Structure

* `main.py` - FastAPI API endpoints
* `alerts.py` - Matching engine and Resend email service
* `auth.py` - Custom JWT auth setup
* `database.py` - Supabase client setup
* `scrapers/main.py` - Adzuna API job scraper script
* `frontend/` - React Vite project

## Environment Variables (.env)

Create a `.env` file in the root directory:

```env
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-anon-key"
JWT_SECRET = "your-jwt-secret"
JWT_ALGORITHM = "HS256"
ADZUNA_APP_ID = "your-adzuna-id"
ADZUNA_APP_KEY = "your-adzuna-key"
RESEND_API_KEY = "re_yourkey"
```

## Setup & Running

### Backend

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

### Scrapers

To scrape new job listings and trigger matched user email alerts:
```bash
python scrapers/main.py
```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
```` _
