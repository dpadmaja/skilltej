from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import get_db, engine
from app.models.models import (Base, User, Certification, ExamAttempt, Question, UserAnswer, 
                               SkillWallet, PaymentTransaction, CertifyProfile, KidsProfile, 
                               ProProfile, LearningContent, ContentEnrollment)
from app.schemas.schemas import *
from app.services.auth_service import (
    AuthService, ExamService, AntiCheatService,
    create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.services.certificate_service import CertificateService, get_proficiency_from_score
from fastapi.responses import StreamingResponse
from datetime import timedelta
from typing import Optional
import uuid
from dotenv import load_dotenv

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skilltej Certify", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency for getting current user
def get_current_user(authorization: Optional[str] = Header(None, alias="Authorization"), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    try:
        parts = authorization.split()
        if len(parts) != 2:
            raise ValueError("Invalid format")
        scheme, token = parts
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )

    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = AuthService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


# ==================== AUTHENTICATION ROUTES ====================

@app.post("/api/auth/signup", response_model=dict)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """User registration"""
    try:
        db_user = AuthService.create_user(
            db,
            email=user.email,
            username=user.username,
            password=user.password,
            full_name=user.full_name,
            product=user.product,
            grade=user.grade,
            city=user.city,
            role=user.role
        )

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
            )

        access_token = create_access_token(data={"sub": db_user.id})
        user_response = UserResponse.model_validate(db_user)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response.model_dump()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )


@app.post("/api/auth/login", response_model=dict)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """User login"""
    try:
        db_user = AuthService.authenticate_user(db, user.email, user.password)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        access_token = create_access_token(data={"sub": db_user.id})
        user_response = UserResponse.model_validate(db_user)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response.model_dump()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@app.post("/api/auth/logout")
def logout():
    """User logout (client-side token deletion)"""
    return {"message": "Logged out successfully"}


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse.model_validate(current_user)


# ==================== CERTIFICATION ROUTES ====================

@app.get("/api/certifications", response_model=list[CertificationResponse])
def get_certifications(db: Session = Depends(get_db)):
    """Get all available certifications"""
    certs = db.query(Certification).all()
    return [CertificationResponse.model_validate(c) for c in certs]


@app.get("/api/certifications/{cert_id}", response_model=CertificationDetailResponse)
def get_certification_detail(cert_id: int, db: Session = Depends(get_db)):
    """Get certification details with questions"""
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")

    return CertificationDetailResponse.model_validate(cert)


# ==================== EXAM ROUTES ====================

@app.post("/api/exams/start", response_model=ExamAttemptResponse)
def start_exam(
    exam_start: ExamAttemptStart,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new exam attempt"""
    exam_attempt = ExamService.start_exam(
        db,
        current_user.id,
        exam_start.certification_id,
        exam_start.ip_address,
        exam_start.device_info
    )

    if not exam_attempt:
        raise HTTPException(status_code=404, detail="Certification not found")

    return ExamAttemptResponse.model_validate(exam_attempt)


@app.get("/api/exams/{exam_attempt_id}", response_model=ExamAttemptResponse)
def get_exam_attempt(
    exam_attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get exam attempt details"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    return ExamAttemptResponse.model_validate(attempt)


@app.get("/api/exams/{exam_attempt_id}/question", response_model=ExamQuestionSession)
def get_current_question(
    exam_attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current question for exam"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    question = ExamService.get_current_question(db, exam_attempt_id)
    if not question:
        raise HTTPException(status_code=404, detail="No more questions")

    all_questions = db.query(Question).filter(
        Question.certification_id == attempt.certification_id
    ).all()

    time_elapsed = 0
    if attempt.start_time:
        from datetime import datetime
        time_elapsed = int((datetime.utcnow() - attempt.start_time).total_seconds())

    time_remaining = max(0, attempt.total_duration_seconds - time_elapsed)

    return ExamQuestionSession(
        current_question_index=attempt.current_question_index,
        total_questions=len(all_questions),
        current_question=QuestionForExamResponse.model_validate(question),
        time_remaining_seconds=time_remaining,
        exam_attempt_id=exam_attempt_id
    )


@app.post("/api/exams/{exam_attempt_id}/answer", response_model=UserAnswerResponse)
def submit_answer(
    exam_attempt_id: int,
    answer: UserAnswerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit answer to a question"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    user_answer = ExamService.submit_answer(
        db,
        exam_attempt_id,
        answer.question_id,
        answer.user_answer,
        answer.time_taken_seconds
    )

    if not user_answer:
        raise HTTPException(status_code=404, detail="Question not found")

    return UserAnswerResponse.model_validate(user_answer)


@app.post("/api/exams/{exam_attempt_id}/next", response_model=ExamAttemptResponse)
def next_question(
    exam_attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Move to next question"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    updated_attempt = ExamService.next_question(db, exam_attempt_id)
    return ExamAttemptResponse.model_validate(updated_attempt)


@app.post("/api/exams/{exam_attempt_id}/previous", response_model=ExamAttemptResponse)
def previous_question(
    exam_attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Move to previous question"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    updated_attempt = ExamService.previous_question(db, exam_attempt_id)
    return ExamAttemptResponse.model_validate(updated_attempt)


@app.post("/api/exams/{exam_attempt_id}/mark-complete", response_model=ExamAttemptResponse)
def mark_complete(
    exam_attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark exam as complete"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    updated_attempt = ExamService.mark_exam_complete(db, exam_attempt_id)
    return ExamAttemptResponse.model_validate(updated_attempt)


@app.post("/api/exams/{exam_attempt_id}/submit", response_model=ExamResultResponse)
def submit_exam(
    exam_attempt_id: int,
    submit_request: ExamSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit exam and get results"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    if not submit_request.confirm_submit:
        raise HTTPException(status_code=400, detail="Submission not confirmed")

    submitted_attempt = ExamService.submit_exam(db, exam_attempt_id)

    # Get answers
    answers = db.query(UserAnswer).filter(
        UserAnswer.exam_attempt_id == exam_attempt_id
    ).all()

    result = ExamResultResponse(
        id=submitted_attempt.id,
        certification_id=submitted_attempt.certification_id,
        total_score=submitted_attempt.total_score,
        is_passed=submitted_attempt.is_passed,
        passing_score=submitted_attempt.passing_score,
        practical_ability=submitted_attempt.practical_ability,
        debugging_ability=submitted_attempt.debugging_ability,
        efficiency_score=submitted_attempt.efficiency_score,
        total_duration_seconds=submitted_attempt.total_duration_seconds,
        attempts_count=submitted_attempt.attempts_count,
        completed_at=submitted_attempt.end_time,
        answers=[UserAnswerResponse.model_validate(a) for a in answers]
    )

    return result


# ==================== DASHBOARD ROUTES ====================

@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user dashboard"""
    # Get all available certifications
    available_certs = db.query(Certification).all()

    # Get in-progress exams
    in_progress = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == current_user.id,
        ExamAttempt.is_submitted == False
    ).all()

    # Get completed certifications
    completed_exams = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == current_user.id,
        ExamAttempt.is_submitted == True,
        ExamAttempt.is_passed == True
    ).all()

    completed_certs = []
    for exam in completed_exams:
        completed_certs.append({
            "certification": CertificationResponse.model_validate(exam.certification),
            "score": exam.total_score,
            "pass_date": exam.end_time,
            "efficiency": exam.efficiency_score,
            "practical_ability": exam.practical_ability,
            "debugging_ability": exam.debugging_ability
        })

    return DashboardResponse(
        available_certifications=[CertificationResponse.model_validate(c) for c in available_certs],
        in_progress_exams=[ExamAttemptResponse.model_validate(e) for e in in_progress],
        completed_certifications=completed_certs,
        total_certifications=len(available_certs),
        total_completed=len(completed_exams)
    )


# ==================== PAYMENT ROUTES ====================

@app.post("/api/payments/initiate", response_model=PaymentResponse)
def initiate_payment(
    payment: PaymentInitiate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate payment for certification (dummy)"""
    cert = db.query(Certification).filter(Certification.id == payment.certification_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")

    # Dummy amount based on certification
    amount = 499.0  # Dummy amount

    order_id = f"order_{uuid.uuid4().hex[:12]}"

    transaction = PaymentTransaction(
        user_id=current_user.id,
        certification_id=payment.certification_id,
        amount=amount,
        currency="INR",
        payment_method="razorpay",
        order_id=order_id,
        status="pending"
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return PaymentResponse(
        id=transaction.id,
        order_id=transaction.order_id,
        amount=transaction.amount,
        currency=transaction.currency,
        payment_method=transaction.payment_method,
        status=transaction.status
    )


@app.post("/api/payments/verify")
def verify_payment(
    verify: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify payment and activate certification"""
    # Dummy verification
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.order_id == verify.order_id,
        PaymentTransaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction.payment_id = verify.payment_id
    transaction.status = "completed"
    db.commit()

    return {"message": "Payment verified successfully", "status": "completed"}


# ==================== SKILL WALLET ROUTES ====================

@app.get("/api/skill-wallet/details", response_model=dict)
def get_skill_wallet_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's skill wallet details"""
    wallet = db.query(SkillWallet).filter(SkillWallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Skill wallet not found")

    return {
        "id": wallet.id,
        "wallet_url": wallet.wallet_url,
        "is_public": wallet.is_public,
        "created_at": wallet.created_at,
        "public_link": f"/skill-wallet/{wallet.wallet_url}" if wallet.is_public else None
    }


@app.post("/api/skill-wallet/toggle-public")
def toggle_skill_wallet_public(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle skill wallet public visibility"""
    wallet = db.query(SkillWallet).filter(SkillWallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Skill wallet not found")

    wallet.is_public = not wallet.is_public
    db.commit()

    return {
        "wallet_url": wallet.wallet_url,
        "is_public": wallet.is_public,
        "public_link": f"/skill-wallet/{wallet.wallet_url}" if wallet.is_public else None
    }


@app.get("/api/skill-wallet/{wallet_url}", response_model=SkillWalletPublicResponse)
def get_public_skill_wallet(wallet_url: str, db: Session = Depends(get_db)):
    """Get public skill wallet"""
    wallet = db.query(SkillWallet).filter(SkillWallet.wallet_url == wallet_url).first()
    if not wallet or not wallet.is_public:
        raise HTTPException(status_code=404, detail="Wallet not found or not public")

    # Get user's passed certifications
    completed_exams = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == wallet.user_id,
        ExamAttempt.is_passed == True
    ).all()

    certs = []
    for exam in completed_exams:
        certs.append({
            "name": exam.certification.name,
            "score": exam.total_score,
            "passed_date": exam.end_time.isoformat() if exam.end_time else None
        })

    return SkillWalletPublicResponse(
        user_name=wallet.user.full_name,
        certifications=certs
    )


# ==================== ANTI-CHEAT ROUTES ====================

@app.post("/api/exams/{exam_attempt_id}/log-tab-switch")
def log_tab_switch(
    exam_attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log tab switch event for anti-cheating"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    AntiCheatService.record_tab_switch(db, exam_attempt_id)
    return {"status": "recorded"}


@app.post("/api/exams/{exam_attempt_id}/log-copy-paste")
def log_copy_paste(
    exam_attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log copy-paste event for anti-cheating"""
    attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    AntiCheatService.record_copy_paste(db, exam_attempt_id)
    return {"status": "recorded"}


# ==================== ADMIN ROUTES (for seeding data) ====================

@app.post("/api/admin/seed-data")
def seed_data(db: Session = Depends(get_db)):
    """Seed database with initial certifications and questions"""
    def _validate_cert(cert_data):
        required = {
            'name': str,
            'description': str,
            'cert_type': str,
            'duration_minutes': int,
            'passing_score': float,
            'total_questions': int,
            'difficulty_level': str,
        }
        for field, typ in required.items():
            if field not in cert_data:
                return False
            if not isinstance(cert_data[field], typ):
                # allow int where float is expected for passing_score if int provided
                if field == 'passing_score' and isinstance(cert_data[field], int):
                    cert_data[field] = float(cert_data[field])
                else:
                    return False
        return True
    # Check if data already exists
    existing = db.query(Certification).first()
    if existing:
        return {"message": "Database already seeded"}

    # Create certifications
    certifications_data = [
        # AI Certifications
        {
            "name": "AI for quality engineers",
            "description": "Master AI techniques for quality assurance and testing",
            "cert_type": "AI",
            "duration_minutes": 120,
            "passing_score": 70.0,
            "total_questions": 30,
            "difficulty_level": "Intermediate"
        },
        {
            "name": "Gen AI fundamentals",
            "description": "Learn the fundamentals of Generative AI",
            "cert_type": "AI",
            "duration_minutes": 90,
            "passing_score": 70.0,
            "total_questions": 25,
            "difficulty_level": "Beginner"
        },
        {
            "name": "Agentic AI fundamentals",
            "description": "Understand Agentic AI systems and their applications",
            "cert_type": "AI",
            "duration_minutes": 100,
            "passing_score": 70.0,
            "total_questions": 28,
            "difficulty_level": "Intermediate"
        },
        {
            "name": "AI for Data analysts",
            "description": "Apply AI techniques for data analysis",
            "cert_type": "AI",
            "duration_minutes": 110,
            "passing_score": 70.0,
            "total_questions": 30,
            "difficulty_level": "Intermediate"
        },
        {
            "name": "AI for software developers",
            "description": "Integrate AI into software development",
            "cert_type": "AI",
            "duration_minutes": 130,
            "passing_score": 70.0,
            "total_questions": 35,
            "difficulty_level": "Expert"
        },
        # Cloud Certifications
        {
            "name": "AWS Cloud Fundamentals",
            "description": "Master AWS cloud services and architecture",
            "cert_type": "Cloud",
            "duration_minutes": 140,
            "passing_score": 70.0,
            "total_questions": 32,
            "difficulty_level": "Beginner"
        },
        {
            "name": "Azure Cloud Solutions",
            "description": "Design and deploy solutions using Microsoft Azure",
            "cert_type": "Cloud",
            "duration_minutes": 150,
            "passing_score": 70.0,
            "total_questions": 35,
            "difficulty_level": "Intermediate"
        },
        {
            "name": "Kubernetes & Container Orchestration",
            "description": "Master containerization and Kubernetes deployment",
            "cert_type": "Cloud",
            "duration_minutes": 120,
            "passing_score": 70.0,
            "total_questions": 30,
            "difficulty_level": "Expert"
        },
        # Data Science Certifications
        {
            "name": "Data Science Fundamentals",
            "description": "Learn core concepts of data science and analytics",
            "cert_type": "Data Science",
            "duration_minutes": 100,
            "passing_score": 70.0,
            "total_questions": 28,
            "difficulty_level": "Beginner"
        },
        {
            "name": "Advanced Machine Learning",
            "description": "Master advanced ML algorithms and techniques",
            "cert_type": "Data Science",
            "duration_minutes": 140,
            "passing_score": 70.0,
            "total_questions": 35,
            "difficulty_level": "Expert"
        },
        # Development Certifications
        {
            "name": "Full Stack Web Development",
            "description": "Build complete web applications",
            "cert_type": "Development",
            "duration_minutes": 160,
            "passing_score": 70.0,
            "total_questions": 40,
            "difficulty_level": "Intermediate"
        },
        {
            "name": "Python Programming Mastery",
            "description": "Master Python for professional development",
            "cert_type": "Development",
            "duration_minutes": 120,
            "passing_score": 70.0,
            "total_questions": 30,
            "difficulty_level": "Beginner"
        },
        # Other Certifications
        {
            "name": "DevOps & CI/CD Pipeline",
            "description": "Implement continuous integration and deployment",
            "cert_type": "DevOps",
            "duration_minutes": 130,
            "passing_score": 70.0,
            "total_questions": 32,
            "difficulty_level": "Intermediate"
        },
        {
            "name": "Cybersecurity Essentials",
            "description": "Learn cybersecurity best practices and tools",
            "cert_type": "Security",
            "duration_minutes": 110,
            "passing_score": 70.0,
            "total_questions": 28,
            "difficulty_level": "Intermediate"
        }
    ]

    # Remove duplicates by name before seeding
    seen_names = set()
    unique_certifications = []
    for cert_data in certifications_data:
        name = cert_data.get('name')
        # Validate certification data
        if not _validate_cert(cert_data):
            continue
        if name in seen_names:
            continue
        seen_names.add(name)
        unique_certifications.append(cert_data)

    for cert_data in unique_certifications:
        cert = Certification(**cert_data)
        db.add(cert)
        db.flush()

        # Add sample questions for each certification
        sample_questions = get_sample_questions(cert.id, cert_data["name"])
        for q_data in sample_questions:
            question = Question(**q_data)
            db.add(question)

    db.commit()
    return {"message": "Database seeded successfully"}


def _generate_ai_questions(cert_id: int, cert_name: str, n: int = 50) -> list:
    questions = []
    for i in range(n):
        questions.append({
            "certification_id": cert_id,
            "question_text": f"AI fundamentals Q{i+1}: conceptual question regarding {cert_name}",
            "question_type": "multiple_choice",
            "difficulty": "easy",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "1",
            "explanation": "General AI concept question",
            "points": 1.0,
            "is_practical": False,
            "topic": "AI Fundamentals"
        })
    return questions

def get_sample_questions(cert_id: int, cert_name: str) -> list:
    """Generate sample questions for a certification"""
    questions = []

    if "ai" in cert_name.lower():
        # For all AI certifications, generate 50 AI-related questions
        return _generate_ai_questions(cert_id, cert_name, 50)
    if "quality engineer" in cert_name.lower():
        questions = [
            {
                "certification_id": cert_id,
                "question_text": "What is the primary purpose of AI in quality assurance?",
                "question_type": "multiple_choice",
                "difficulty": "easy",
                "options": ["Reducing costs", "Automating test execution and detection", "Improving aesthetics", "Enhancing UI"],
                "correct_answer": "1",
                "explanation": "AI in QA is primarily used for automating test execution and detecting defects",
                "points": 1.0,
                "is_practical": False,
                "topic": "AI in QA"
            },
            {
                "certification_id": cert_id,
                "question_text": "Write a Python script to create a simple test automation framework",
                "question_type": "practical",
                "difficulty": "hard",
                "correct_answer": "import unittest",
                "explanation": "A test automation framework should use unittest or pytest",
                "points": 3.0,
                "is_practical": True,
                "topic": "Automation Framework"
            }
        ]
    elif "gen ai" in cert_name.lower():
        questions = [
            {
                "certification_id": cert_id,
                "question_text": "What does GPT stand for?",
                "question_type": "multiple_choice",
                "difficulty": "easy",
                "options": ["General Purpose Technology", "Generative Pre-trained Transformer", "Global Processing Tool", "Generic Programming Tool"],
                "correct_answer": "1",
                "explanation": "GPT stands for Generative Pre-trained Transformer",
                "points": 1.0,
                "is_practical": False,
                "topic": "Gen AI Basics"
            },
            {
                "certification_id": cert_id,
                "question_text": "True or False: Transformer models use self-attention mechanisms",
                "question_type": "true_false",
                "difficulty": "medium",
                "correct_answer": "true",
                "explanation": "Yes, transformers use self-attention mechanisms as their core component",
                "points": 1.0,
                "is_practical": False,
                "topic": "Transformers"
            }
        ]
    else:
        # Default questions
        questions = [
            {
                "certification_id": cert_id,
                "question_text": "What is the main focus of this certification?",
                "question_type": "multiple_choice",
                "difficulty": "easy",
                "options": ["Theory", "Practical Application", "History", "Philosophy"],
                "correct_answer": "1",
                "explanation": "Most certifications focus on practical application",
                "points": 1.0,
                "is_practical": False,
                "topic": "Certification Overview"
            }
        ]

    # Ensure we have at least 50 questions total by appending generic questions
    if len(questions) < 50:
        additional = 50 - len(questions)
        for i in range(additional):
            questions.append({
                "certification_id": cert_id,
                "question_text": f"General knowledge question {i+1} for {cert_name}",
                "question_type": "multiple_choice",
                "difficulty": "easy",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "1",
                "explanation": "General question for expansion",
                "points": 1.0,
                "is_practical": False,
                "topic": "General"
            })
    return questions


# ==================== CERTIFICATE ROUTES ====================

@app.get("/api/certificates/{exam_attempt_id}")
def download_certificate(
    exam_attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download certificate PDF for passed exam"""
    # Get exam attempt
    exam_attempt = ExamService.get_exam_attempt(db, exam_attempt_id)
    if not exam_attempt or exam_attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Verify exam was passed
    if not exam_attempt.is_passed:
        raise HTTPException(status_code=400, detail="Certification not passed")
    
    if not exam_attempt.is_submitted:
        raise HTTPException(status_code=400, detail="Exam not submitted")
    
    # Get certification details
    certification = exam_attempt.certification
    
    # Determine proficiency level based on score
    proficiency_level = get_proficiency_from_score(exam_attempt.total_score or 0)
    
    # Generate certificate
    certificate_pdf = CertificateService.generate_certificate(
        recipient_name=current_user.full_name or current_user.username,
        skill_title=certification.name,
        proficiency_level=proficiency_level,
        issue_date=exam_attempt.end_time,
        organization_name="Skilltej",
        exam_score=exam_attempt.total_score
    )
    
    # Create filename
    filename = f"certificate_{certification.id}_{current_user.id}_{exam_attempt_id}.pdf"
    
    # Return PDF as streaming response
    return StreamingResponse(
        iter([certificate_pdf.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
