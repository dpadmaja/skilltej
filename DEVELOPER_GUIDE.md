# Developer Guide - Skilltej Certify

## Overview

This guide helps developers extend and customize the Skilltej Certify platform.

## Adding New Certifications

### Backend Steps

1. **Add to Database** (Create migration or manual entry):
```python
# In database or admin seed
new_cert = Certification(
    name="Your Certification Name",
    description="Description",
    cert_type="Category Name",
    duration_minutes=120,
    passing_score=70.0,
    total_questions=30
)
db.add(new_cert)
db.commit()
```

2. **Add Questions** to the question bank:
```python
question = Question(
    certification_id=cert.id,
    question_text="Question text here?",
    question_type="multiple_choice",  # or true_false, short_answer, practical
    difficulty="medium",  # easy, medium, hard
    options=["Option 1", "Option 2", "Option 3", "Option 4"],
    correct_answer="1",  # Index of correct option
    explanation="Explanation text",
    points=1.0,
    is_practical=False,
    topic="Topic Name"
)
```

### Frontend Changes

No code changes needed - automatically appears in dashboard!

## Adding Custom Question Types

### Backend

1. **Update QuestionType enum** in `backend/app/models/models.py`:
```python
class QuestionType(str, enum.Enum):
    # ... existing types
    ESSAY = "essay"
    MATCHING = "matching"
    DRAG_DROP = "drag_drop"
```

2. **Update Question schema** in `backend/app/schemas/schemas.py`:
```python
# Add handling for new types
```

3. **Update evaluation logic** in `backend/app/services/auth_service.py`:
```python
def evaluate_answer(question_type, user_answer, correct_answer):
    if question_type == "essay":
        # Implement essay grading logic
        pass
```

### Frontend

Update `frontend/src/pages/ExamPage.jsx`:
```jsx
{currentQuestion.current_question.question_type === 'essay' && (
    <textarea
        value={selectedAnswer || ''}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        placeholder="Enter your essay here..."
        className="w-full p-4 border border-gray-300 rounded-lg"
        rows={6}
    />
)}
```

## Integrating Real Razorpay

### Backend Setup

1. **Update .env**:
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

2. **Install Razorpay SDK**:
```bash
pip install razorpay
```

3. **Update payment service** in `backend/app/services/auth_service.py`:
```python
import razorpay

class PaymentService:
    @staticmethod
    def create_order(amount, user_id, cert_id):
        client = razorpay.Client(
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
        )
        
        order = client.order.create({
            'amount': amount * 100,  # Amount in paise
            'currency': 'INR',
            'receipt': f'order_{user_id}_{cert_id}'
        })
        return order
    
    @staticmethod
    def verify_payment(payment_id, order_id, signature):
        client = razorpay.Client()
        return client.utility.verify_payment_signature({
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })
```

4. **Update main.py** payment endpoint:
```python
@app.post("/api/payments/initiate")
def initiate_payment(payment: PaymentInitiate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Use PaymentService instead of dummy
    order = PaymentService.create_order(499.0, current_user.id, payment.certification_id)
    # ... save transaction
```

### Frontend Updates

Update `frontend/src/pages/PaymentPage.jsx`:
```jsx
const loadRazorpay = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
};

const handleRazorpayPayment = () => {
    const options = {
        key: 'YOUR_KEY_ID',
        amount: payment.amount * 100,
        currency: 'INR',
        name: 'Skilltej Certify',
        order_id: payment.order_id,
        handler: handlePaymentSuccess,
        prefill: {
            email: current_user.email,
            name: current_user.full_name
        }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
};
```

## Adding Email Notifications

### Backend

1. **Install email package**:
```bash
pip install python-multipart aiosmtplib emails
```

2. **Create email service** in `backend/app/services/email_service.py`:
```python
from emails import Message

class EmailService:
    @staticmethod
    def send_exam_result(user_email, user_name, cert_name, score, is_passed):
        message = Message(
            subject=f"Your Exam Result - {cert_name}",
            mail_from="noreply@skilltej.com",
            html=f"""
            <h2>Exam Result</h2>
            <p>Hi {user_name},</p>
            <p>You {'passed' if is_passed else 'did not pass'} the {cert_name} exam.</p>
            <p>Your score: {score}%</p>
            """
        )
        # Send via SMTP
        pass
```

3. **Call in exam submission**:
```python
if attempted.is_submitted:
    EmailService.send_exam_result(...)
```

## Adding Analytics Dashboard

### Backend

1. **Create analytics service** in `backend/app/services/analytics_service.py`:
```python
class AnalyticsService:
    @staticmethod
    def get_user_stats(db: Session, user_id: int):
        total_attempts = db.query(ExamAttempt).filter(ExamAttempt.user_id == user_id).count()
        passed = db.query(ExamAttempt).filter(
            ExamAttempt.user_id == user_id,
            ExamAttempt.is_passed == True
        ).count()
        
        return {
            'total_attempts': total_attempts,
            'passed_exams': passed,
            'pass_rate': (passed / total_attempts * 100) if total_attempts > 0 else 0
        }
```

2. **Add endpoint**:
```python
@app.get("/api/analytics/user-stats")
def get_user_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AnalyticsService.get_user_stats(db, current_user.id)
```

### Frontend

Create `frontend/src/pages/AnalyticsPage.jsx`:
```jsx
function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    
    useEffect(() => {
        const loadStats = async () => {
            const response = await apiClient.get('/analytics/user-stats');
            setStats(response.data);
        };
        loadStats();
    }, []);
    
    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Your Analytics</h1>
            {/* Display stats */}
        </div>
    );
}
```

## Adding WebSocket Support (Real-time Updates)

1. **Install WebSocket library**:
```bash
pip install python-socketio python-engineio
```

2. **Update FastAPI**:
```python
from fastapi_socketio import SocketManager

sio = SocketManager(app=app, cors_allowed_origins='*')

@sio.event
def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def submit_answer(sid, answer_data):
    # Process answer
    await sio.emit('answer_received', {'status': 'success'}, to=sid)
```

## Customizing Styling

### Update Tailwind Config

Edit `frontend/tailwind.config.js`:
```javascript
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: '#your-color',
                secondary: '#your-color',
                accent: '#your-color'
            },
            fontFamily: {
                sans: ['Your Font', 'sans-serif']
            }
        }
    }
}
```

### Update Global Styles

Edit `frontend/src/styles/globals.css` to add custom styles.

## Database Optimization

### Add Indexes

```python
# In models.py, add to columns:
user_id = Column(Integer, ForeignKey("users.id"), index=True)
certification_id = Column(Integer, ForeignKey("certifications.id"), index=True)
is_passed = Column(Boolean, index=True)
```

### Query Optimization

```python
# Good
result = db.query(ExamAttempt).filter(
    ExamAttempt.user_id == user_id,
    ExamAttempt.is_submitted == True
).options(joinedload(ExamAttempt.user)).all()

# Bad (N+1 query problem)
for attempt in attempts:
    print(attempt.user.name)  # Creates new query each iteration
```

## Testing

### Backend Testing

Create `backend/test_api.py`:
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_signup():
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "test123456",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200

def test_login():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "test123456"
        }
    )
    assert response.status_code == 200
```

Run: `pytest backend/test_api.py`

### Frontend Testing

Add to `package.json`:
```json
{
  "devDependencies": {
    "vitest": "latest",
    "@testing-library/react": "latest"
  }
}
```

## Performance Tips

1. **Database**: 
   - Use `.select_from()` for complex queries
   - Add indexes on frequently queried columns
   - Use connection pooling

2. **Backend**:
   - Enable gzip compression
   - Use async/await for I/O operations
   - Cache responses where appropriate

3. **Frontend**:
   - Code splitting with React.lazy()
   - Image optimization
   - Minimize bundle size

## Best Practices

1. **Code Organization**: Keep models, schemas, and services separate
2. **Error Handling**: Use proper HTTP status codes and meaningful error messages
3. **Validation**: Use Pydantic for input validation
4. **Documentation**: Document all APIs and complex logic
5. **Testing**: Write tests for critical functionality
6. **Security**: Keep dependencies updated, use environment variables
7. **Performance**: Profile and optimize slow queries

## Deployment Considerations

1. **Backend**:
   - Use Gunicorn/uWSGI with multiple workers
   - Set up database connection pooling
   - Use reverse proxy (Nginx)
   - Enable HTTPS

2. **Frontend**:
   - Build for production
   - Deploy to CDN
   - Set up service worker for offline support
   - Configure caching headers

## Troubleshooting Common Issues

### CORS Errors
```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Database Connection Issues
```python
# Add connection pool settings
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20
)
```

### Frontend Build Issues
```bash
npm cache clean --force
rm -rf node_modules
npm install
npm run build
```

---

**Happy developing! 🚀**
