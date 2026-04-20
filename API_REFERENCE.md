# Skilltej Certify - API Reference

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.skilltej.com` (configure accordingly)

## Authentication
All endpoints (except public ones) require Authorization header:
```
Authorization: Bearer {access_token}
```

---

## 🔐 Authentication Endpoints

### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "full_name": "Full Name",
    "is_active": true,
    "created_at": "2026-04-20T10:00:00"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {...}
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "is_active": true,
  "created_at": "2026-04-20T10:00:00"
}
```

---

## 📚 Certification Endpoints

### Get All Certifications
```http
GET /api/certifications

Response: 200 OK
[
  {
    "id": 1,
    "name": "AI for quality engineers",
    "description": "Master AI techniques for QA",
    "cert_type": "AI for quality engineers",
    "duration_minutes": 120,
    "passing_score": 70.0,
    "total_questions": 30
  },
  ...
]
```

### Get Certification Details
```http
GET /api/certifications/{cert_id}

Response: 200 OK
{
  "id": 1,
  "name": "AI for quality engineers",
  "description": "Master AI techniques for QA",
  "cert_type": "AI for quality engineers",
  "duration_minutes": 120,
  "passing_score": 70.0,
  "total_questions": 30,
  "questions": [
    {
      "id": 1,
      "certification_id": 1,
      "question_text": "What is AI?",
      "question_type": "multiple_choice",
      "difficulty": "easy",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "explanation": "AI stands for...",
      "points": 1.0,
      "is_practical": false,
      "topic": "Basics"
    },
    ...
  ]
}
```

---

## 🎯 Exam Endpoints

### Start Exam
```http
POST /api/exams/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "certification_id": 1,
  "ip_address": "192.168.1.1",
  "device_info": {
    "user_agent": "Mozilla/5.0...",
    "os": "Windows 10"
  }
}

Response: 200 OK
{
  "id": 1,
  "certification_id": 1,
  "start_time": "2026-04-20T10:00:00",
  "end_time": null,
  "total_duration_seconds": 7200,
  "is_completed": false,
  "is_submitted": false,
  "current_question_index": 0,
  "total_score": null,
  "is_passed": null,
  "attempts_count": 1
}
```

### Get Exam Attempt
```http
GET /api/exams/{exam_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "certification_id": 1,
  "start_time": "2026-04-20T10:00:00",
  "end_time": null,
  "total_duration_seconds": 7200,
  "is_completed": false,
  "is_submitted": false,
  "current_question_index": 0,
  ...
}
```

### Get Current Question
```http
GET /api/exams/{exam_id}/question
Authorization: Bearer {token}

Response: 200 OK
{
  "current_question_index": 0,
  "total_questions": 30,
  "current_question": {
    "id": 1,
    "question_text": "What is AI?",
    "question_type": "multiple_choice",
    "difficulty": "easy",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "is_practical": false,
    "topic": "Basics"
  },
  "time_remaining_seconds": 7200,
  "exam_attempt_id": 1
}
```

### Submit Answer
```http
POST /api/exams/{exam_id}/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "question_id": 1,
  "user_answer": "1",
  "time_taken_seconds": 25
}

Response: 200 OK
{
  "id": 1,
  "question_id": 1,
  "user_answer": "1",
  "is_correct": true,
  "score_obtained": 1.0,
  "time_taken_seconds": 25,
  "answered_at": "2026-04-20T10:00:30"
}
```

### Next Question
```http
POST /api/exams/{exam_id}/next
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "certification_id": 1,
  "current_question_index": 1,
  ...
}
```

### Previous Question
```http
POST /api/exams/{exam_id}/previous
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "certification_id": 1,
  "current_question_index": -1,
  ...
}
```

### Mark Exam Complete
```http
POST /api/exams/{exam_id}/mark-complete
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "is_completed": true,
  ...
}
```

### Submit Exam
```http
POST /api/exams/{exam_id}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirm_submit": true
}

Response: 200 OK
{
  "id": 1,
  "certification_id": 1,
  "total_score": 85.5,
  "is_passed": true,
  "passing_score": 70.0,
  "practical_ability": 88.0,
  "debugging_ability": 92.0,
  "efficiency_score": 85.0,
  "total_duration_seconds": 7200,
  "attempts_count": 1,
  "completed_at": "2026-04-20T10:30:00",
  "answers": [
    {
      "id": 1,
      "question_id": 1,
      "user_answer": "1",
      "is_correct": true,
      "score_obtained": 1.0,
      "time_taken_seconds": 25,
      "answered_at": "2026-04-20T10:00:30"
    },
    ...
  ]
}
```

### Log Tab Switch (Anti-Cheating)
```http
POST /api/exams/{exam_id}/log-tab-switch
Authorization: Bearer {token}

Response: 200 OK
{
  "status": "recorded"
}
```

### Log Copy-Paste (Anti-Cheating)
```http
POST /api/exams/{exam_id}/log-copy-paste
Authorization: Bearer {token}

Response: 200 OK
{
  "status": "recorded"
}
```

---

## 📊 Dashboard Endpoints

### Get Dashboard
```http
GET /api/dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "available_certifications": [
    {
      "id": 1,
      "name": "AI for quality engineers",
      ...
    },
    ...
  ],
  "in_progress_exams": [
    {
      "id": 1,
      "certification_id": 1,
      ...
    }
  ],
  "completed_certifications": [
    {
      "certification": {...},
      "score": 85.5,
      "pass_date": "2026-04-20T10:30:00",
      "efficiency": 85.0,
      "practical_ability": 88.0,
      "debugging_ability": 92.0"
    },
    ...
  ],
  "total_certifications": 5,
  "total_completed": 1
}
```

---

## 💳 Payment Endpoints

### Initiate Payment
```http
POST /api/payments/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "certification_id": 1
}

Response: 200 OK
{
  "id": 1,
  "order_id": "order_abc123def456",
  "amount": 499.0,
  "currency": "INR",
  "payment_method": "razorpay",
  "status": "pending"
}
```

### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "payment_id": "pay_abc123def456",
  "order_id": "order_abc123def456",
  "signature": "signature_abc123def456"
}

Response: 200 OK
{
  "message": "Payment verified successfully",
  "status": "completed"
}
```

---

## 🎖️ Skill Wallet Endpoints

### Get Public Skill Wallet
```http
GET /api/skill-wallet/{wallet_url}

Response: 200 OK
{
  "user_name": "Full Name",
  "certifications": [
    {
      "name": "AI for quality engineers",
      "score": 85.5,
      "passed_date": "2026-04-20T10:30:00"
    },
    ...
  ]
}
```

### Toggle Skill Wallet Public
```http
POST /api/skill-wallet/toggle-public
Authorization: Bearer {token}

Response: 200 OK
{
  "wallet_url": "wallet_1_abc123",
  "is_public": true,
  "public_link": "/skill-wallet/wallet_1_abc123"
}
```

---

## Error Responses

### Bad Request (400)
```json
{
  "detail": "Email or username already registered"
}
```

### Unauthorized (401)
```json
{
  "detail": "Invalid token"
}
```

### Not Found (404)
```json
{
  "detail": "Certification not found"
}
```

### Internal Server Error (500)
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently not enforced but recommended for production:
- Login attempts: 5 per minute
- Payment endpoints: 10 per minute
- General API: 100 per minute

---

## Pagination

For list endpoints, add query parameters:
```http
GET /api/certifications?skip=0&limit=10

Parameters:
- skip: Number of records to skip (default: 0)
- limit: Number of records to return (default: 10)
```

---

## Filtering

For available endpoints:
```http
GET /api/exams?status=submitted&user_id=1
```

---

## Testing Endpoints

### Seed Test Data
```http
POST /api/admin/seed-data

Response: 200 OK
{
  "message": "Database seeded successfully"
}
```

### Health Check
```http
GET /health

Response: 200 OK
{
  "status": "healthy"
}
```

---

## API Documentation

Interactive documentation available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Rate Limiting Headers

Response includes:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## Webhook Events (Future)

Planned webhook support:
- `exam.completed`
- `exam.passed`
- `exam.failed`
- `payment.completed`
- `user.registered`

---

## SDK Examples

### Python
```python
import requests

headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/dashboard', headers=headers)
```

### JavaScript
```javascript
const response = await fetch('http://localhost:8000/api/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/dashboard
```

---

**For more information, visit: http://localhost:8000/docs**
