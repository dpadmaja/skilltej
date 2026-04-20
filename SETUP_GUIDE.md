# Skilltej Certify - Setup Guide

## Quick Overview

Skilltej Certify is a professional certification platform built with:
- **Backend**: FastAPI + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS

The platform includes 5 certifications with real-world questions, auto-evaluation, and skill wallet sharing.

## System Requirements

- **Python**: 3.8 or higher
- **Node.js**: 14.0 or higher
- **PostgreSQL**: 12 or higher
- **RAM**: 2GB minimum
- **Storage**: 500MB minimum

## Step-by-Step Setup

### Step 1: Database Setup

**On Windows (Command Prompt):**
```bash
# Open PostgreSQL prompt
psql -U postgres

# Create database
CREATE DATABASE skilltej_certify;

# Exit
\q
```

**On macOS/Linux:**
```bash
createdb skilltej_certify
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Update .env file (if needed)
# DATABASE_URL=postgresql://postgres:password@localhost:5432/skilltej_certify

# Start backend server
python run.py
```

The backend will run on: `http://localhost:8000`


### Step 3: Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on: `http://localhost:3000`

### Step 4: Seed Database (New Terminal)

```bash
# Add test certifications and questions
curl -X POST http://localhost:8000/api/admin/seed-data
```

Or via Python:
```python
import requests
requests.post('http://localhost:8000/api/admin/seed-data')
```

### Step 5: Access the Application

Open your browser and go to: `http://localhost:3000`

## Testing the Application

### Create Test Account

1. Click "Sign up" on the login page
2. Fill in:
   - Full Name: Test User
   - Username: testuser
   - Email: test@example.com
   - Password: test123456
3. Click "Create Account"

### Take an Exam

1. From dashboard, click on any certification
2. Review details and click "Proceed to Payment"
3. Click "Simulate Payment Success (Demo)" button
4. Complete the exam by answering all questions
5. Review your results and scores

### Share on Skill Wallet

1. Go to "Skill Wallet" from navbar
2. Toggle "Make Public"
3. Copy your wallet link
4. Share on LinkedIn or Twitter

## Features Walkthrough

### 1. Authentication ✓
- Sign up with email verification logic
- Login with email/password
- JWT token-based sessions
- Logout functionality

### 2. Dashboard ✓
- View all available certifications
- See in-progress exams
- View completed certifications with scores
- Quick statistics

### 3. Certification Details ✓
- Certification information
- Duration and question count
- Pass score requirement
- Features included

### 4. Payment Flow ✓
- Order summary
- Demo payment gateway
- Transaction tracking
- Automatic exam start after payment

### 5. Exam Interface ✓
- Real-time countdown timer
- Current question display
- Navigation (Previous/Next)
- Multiple question types:
  - Multiple choice
  - True/False
  - Practical questions
- Difficulty indicators
- Auto-submit on timeout

### 6. Anti-Cheating ✓
- Tab switch detection
- Copy-paste logging
- Device/IP tracking
- Cheating risk scoring

### 7. Results Dashboard ✓
- Overall score percentage
- Pass/Fail status
- Practical Ability (%)
- Debugging Ability (%)
- Efficiency Score (%)
- Answer review with explanations

### 8. Skill Wallet ✓
- Public/Private toggle
- LinkedIn sharing
- Twitter sharing
- Shareable links
- Public profile viewing

## Available Certifications

1. **AI for Quality Engineers**
   - Duration: 120 minutes
   - Questions: 30
   - Pass Score: 70%

2. **Gen AI Fundamentals**
   - Duration: 90 minutes
   - Questions: 25
   - Pass Score: 70%

3. **Agentic AI Fundamentals**
   - Duration: 100 minutes
   - Questions: 28
   - Pass Score: 70%

4. **AI for Data Analysts**
   - Duration: 110 minutes
   - Questions: 30
   - Pass Score: 70%

5. **AI for Software Developers**
   - Duration: 130 minutes
   - Questions: 35
   - Pass Score: 70%

## API Endpoints

Full API documentation available at: `http://localhost:8000/docs`

### Key Endpoints

**Auth**
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

**Exams**
- POST `/api/exams/start`
- GET `/api/exams/{exam_id}/question`
- POST `/api/exams/{exam_id}/answer`
- POST `/api/exams/{exam_id}/submit`

**Dashboard**
- GET `/api/dashboard`

**Payments**
- POST `/api/payments/initiate`
- POST `/api/payments/verify`

**Skill Wallet**
- GET `/api/skill-wallet/{wallet_url}`
- POST `/api/skill-wallet/toggle-public`

## Troubleshooting

### Issue: Port already in use

**Solution**: Change the port in the command
```bash
# Backend on port 8001
uvicorn app.main:app --reload --port 8001

# Frontend on port 3001
npm run dev -- --port 3001
```

### Issue: PostgreSQL connection refused

**Solution**: 
1. Check if PostgreSQL is running
2. Verify credentials in .env
3. Create database if not exists: `createdb skilltej_certify`

### Issue: Frontend can't connect to backend

**Solution**:
1. Ensure backend is running on port 8000
2. Check CORS configuration in backend
3. Try accessing `http://localhost:8000/docs` directly

### Issue: Import errors in backend

**Solution**:
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: npm dependencies error

**Solution**:
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

## File Structure

```
Skilltej Certify/
├── backend/
│   ├── app/
│   │   ├── models/models.py       # Database models
│   │   ├── schemas/schemas.py     # Request/Response schemas
│   │   ├── services/auth_service.py # Business logic
│   │   └── main.py                # FastAPI app
│   ├── database/database.py        # DB connection
│   ├── requirements.txt
│   ├── .env
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── pages/                 # Page components
│   │   ├── services/api.js        # API calls
│   │   ├── styles/globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── README.md                       # Full documentation
└── SETUP_GUIDE.md                # This file
```

## Next Steps

1. ✅ Start the backend server
2. ✅ Start the frontend development server
3. ✅ Create a test account
4. ✅ Take a certification exam
5. ✅ Check your results and scores
6. ✅ Share your certification on social media

## Production Deployment

For production deployment:

### Backend
1. Set `DEBUG=False` in .env
2. Use a production WSGI server (Gunicorn)
3. Set up HTTPS with SSL certificate
4. Use environment-specific secrets

### Frontend
1. Build for production: `npm run build`
2. Deploy dist folder to CDN/static server
3. Configure API endpoints for production

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review API documentation at `/docs`
3. Check logs for error messages

---

**Happy Learning! 🚀**
