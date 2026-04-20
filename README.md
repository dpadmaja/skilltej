# Skilltej Certify - Professional Certification Platform

A comprehensive platform for online certifications with real-time exam management, automated evaluation, and skill wallet sharing.

## Features

✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Secure password hashing

✅ **Certification Management**
- 5 pre-configured certifications
  - AI for quality engineers
  - Gen AI fundamentals
  - Agentic AI fundamentals
  - AI for Data analysts
  - AI for software developers
- Certification details with duration and passing scores

✅ **Exam System**
- Real-time timer with auto-submit on timeout
- Question navigation (Previous/Next)
- Question summary and review
- Multiple question types: MCQ, True/False, Practical
- Difficulty levels: Easy, Medium, Hard

✅ **Anti-Cheating Measures**
- Tab switch detection
- Copy-paste logging
- Device and IP tracking
- Cheating risk scoring

✅ **Evaluation System**
- Automatic score calculation
- Pass/Fail determination
- Practical ability scoring
- Debugging ability scoring
- Efficiency score based on time taken

✅ **Payment Integration**
- Dummy Razorpay integration (demo mode)
- Transaction tracking
- Payment status management

✅ **Skill Wallet**
- Public/Private profile toggle
- LinkedIn sharing
- Twitter sharing
- Shareable links
- Achievement verification

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT (Python-Jose, PyJWT)
- **Password Hashing**: Bcrypt
- **ORM**: SQLAlchemy

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React

## Project Structure

```
Skilltej Certify/
├── backend/
│   ├── app/
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Custom middleware
│   │   └── main.py          # FastAPI application
│   ├── database/
│   │   └── database.py      # Database configuration
│   ├── requirements.txt      # Python dependencies
│   ├── .env                 # Environment variables
│   └── run.py              # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── styles/          # CSS files
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Clone the repository**
```bash
cd "d:\AI Products\Skilltej Certify\backend"
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup PostgreSQL Database**
```bash
# Create database
createdb skilltej_certify

# Or using psql:
psql -U postgres
CREATE DATABASE skilltej_certify;
```

5. **Update .env file**
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/skilltej_certify
SECRET_KEY=your-secret-key-change-in-production
```

6. **Run database migrations (tables created automatically)**
```bash
python -c "from app.main import Base, engine; Base.metadata.create_all(bind=engine)"
```

7. **Seed initial data**
```bash
curl -X POST http://localhost:8000/api/admin/seed-data
```

8. **Start backend server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd "d:\AI Products\Skilltej Certify\frontend"
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Certifications
- `GET /api/certifications` - Get all certifications
- `GET /api/certifications/{cert_id}` - Get certification details

### Exams
- `POST /api/exams/start` - Start new exam
- `GET /api/exams/{exam_id}` - Get exam details
- `GET /api/exams/{exam_id}/question` - Get current question
- `POST /api/exams/{exam_id}/answer` - Submit answer
- `POST /api/exams/{exam_id}/next` - Move to next question
- `POST /api/exams/{exam_id}/previous` - Move to previous question
- `POST /api/exams/{exam_id}/mark-complete` - Mark exam complete
- `POST /api/exams/{exam_id}/submit` - Submit exam and get results

### Dashboard
- `GET /api/dashboard` - Get user dashboard data

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment

### Skill Wallet
- `GET /api/skill-wallet/{wallet_url}` - Get public skill wallet
- `POST /api/skill-wallet/toggle-public` - Toggle wallet visibility

### Anti-Cheat
- `POST /api/exams/{exam_id}/log-tab-switch` - Log tab switch
- `POST /api/exams/{exam_id}/log-copy-paste` - Log copy-paste

## Database Schema

### Users
- id, email, username, hashed_password, full_name, is_active, created_at, updated_at

### Certifications
- id, name, description, cert_type, duration_minutes, passing_score, total_questions

### Questions
- id, certification_id, question_text, question_type, difficulty, options, correct_answer, explanation, points, is_practical, topic

### ExamAttempts
- id, user_id, certification_id, start_time, end_time, total_duration_seconds, is_completed, is_submitted, total_score, is_passed, practical_ability, debugging_ability, efficiency_score, tab_switch_count, copy_paste_count

### UserAnswers
- id, exam_attempt_id, question_id, user_answer, is_correct, score_obtained, time_taken_seconds

### SkillWallet
- id, user_id, wallet_url, is_public, created_at, updated_at

### PaymentTransactions
- id, user_id, certification_id, amount, currency, payment_method, order_id, payment_id, status

## Key Features Implementation

### Anti-Cheating System
- **Tab Switching**: Detects when user switches tabs and records count
- **Copy-Paste Detection**: Logs copy-paste events during exam
- **Device Tracking**: Records IP address and device info
- **Cheating Score**: Calculates risk score based on suspicious activities

### Evaluation Engine
- **Score Calculation**: Auto-calculates score based on correct answers
- **Pass/Fail Logic**: Compares with passing score threshold
- **Practical Ability**: Percentage of correct practical questions
- **Debugging Ability**: Percentage of correct hard difficulty questions
- **Efficiency Score**: Based on time ratio (time remaining / total time)

### Question Bank
- Multiple choice questions with options
- True/False questions
- Short answer questions
- Practical coding questions
- Difficulty levels and topic categorization

## Testing the Application

### Test Credentials
After seeding data, you can use any credentials to sign up. Here's a sample:
- Email: `test@example.com`
- Username: `testuser`
- Password: `test123456`
- Full Name: `Test User`

### Test Flow
1. Sign up or login
2. View available certifications on dashboard
3. Click on a certification to view details
4. Proceed to payment
5. Simulate payment success
6. Complete exam with all questions
7. Review results and scores
8. Visit skill wallet to share certifications

## Configuration

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/skilltej_certify
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

**Frontend (vite.config.js)**
- API proxy automatically configured to backend at localhost:8000
- CORS enabled to allow cross-origin requests

## Performance Considerations

1. **Database**: Indexed queries on user_id, certification_id, exam_attempt_id
2. **Caching**: Consider implementing Redis for session management
3. **API Rate Limiting**: Implement rate limiting for payment endpoints
4. **Frontend**: Vite optimizes with code splitting and lazy loading

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Password**: Bcrypt hashing with salt
3. **Database**: SQL prepared statements via SQLAlchemy ORM
4. **CORS**: Configured for production domains
5. **HTTPS**: Use HTTPS in production
6. **Payment**: Razorpay signature verification needed in production

## Future Enhancements

1. Email notifications for exam completion
2. Certificate download (PDF generation)
3. Leaderboard system
4. Real proctoring with webcam monitoring
5. Mock exams and practice tests
6. Detailed analytics dashboard
7. Multi-language support
8. Mobile app (React Native)
9. AI-powered question generation
10. Real Razorpay integration

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -d skilltej_certify
```

### Port Already in Use
```bash
# Backend on different port
uvicorn app.main:app --reload --port 8001

# Frontend on different port
npm run dev -- --port 3001
```

### CORS Errors
- Ensure backend is running on http://localhost:8000
- Check frontend proxy configuration in vite.config.js

## Support & Documentation

For detailed API documentation, visit: `http://localhost:8000/docs`

## License

MIT License - Feel free to use for personal and commercial projects.

## Contributing

Pull requests welcome! Please follow the existing code structure and style.

---

**Built with ❤️ for AI and Advanced Technologies Education**
