from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional, Any


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Certification Schemas
class CertificationCreate(BaseModel):
    name: str
    description: str
    cert_type: str
    duration_minutes: int
    passing_score: float = 70.0
    total_questions: int
    difficulty_level: str = "Beginner"


class CertificationResponse(BaseModel):
    id: int
    name: str
    description: str
    cert_type: str
    duration_minutes: int
    passing_score: float
    total_questions: int
    difficulty_level: str = "Beginner"

    class Config:
        from_attributes = True


class CertificationDetailResponse(CertificationResponse):
    questions: List["QuestionResponse"] = []


# Question Schemas
class QuestionCreate(BaseModel):
    certification_id: int
    question_text: str
    question_type: str
    difficulty: str = "medium"
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    points: float = 1.0
    is_practical: bool = False
    topic: str


class QuestionResponse(BaseModel):
    id: int
    certification_id: int
    question_text: str
    question_type: str
    difficulty: str
    options: Optional[List[str]] = None
    explanation: str
    points: float
    is_practical: bool
    topic: str

    class Config:
        from_attributes = True


# User Answer Schema
class UserAnswerCreate(BaseModel):
    question_id: int
    user_answer: str
    time_taken_seconds: int


class UserAnswerResponse(BaseModel):
    id: int
    question_id: int
    user_answer: str
    is_correct: Optional[bool] = None
    score_obtained: float
    time_taken_seconds: int
    answered_at: datetime

    class Config:
        from_attributes = True


# Exam Attempt Schemas
class ExamAttemptStart(BaseModel):
    certification_id: int
    ip_address: str
    device_info: Optional[dict] = None


class ExamAttemptResponse(BaseModel):
    id: int
    certification_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    total_duration_seconds: int
    is_completed: bool
    is_submitted: bool
    current_question_index: int
    total_score: Optional[float] = None
    is_passed: Optional[bool] = None
    practical_ability: Optional[float] = None
    debugging_ability: Optional[float] = None
    efficiency_score: Optional[float] = None
    attempts_count: int

    class Config:
        from_attributes = True


class ExamCompleteRequest(BaseModel):
    pass  # Confirmation to complete exam


class ExamSubmitRequest(BaseModel):
    confirm_submit: bool


class ExamResultResponse(BaseModel):
    id: int
    certification_id: int
    total_score: float
    is_passed: bool
    passing_score: float
    practical_ability: float
    debugging_ability: float
    efficiency_score: float
    total_duration_seconds: int
    attempts_count: int
    completed_at: datetime
    answers: List[UserAnswerResponse] = []

    class Config:
        from_attributes = True


# Skill Wallet Schemas
class SkillWalletCreate(BaseModel):
    pass


class SkillWalletResponse(BaseModel):
    id: int
    wallet_url: str
    is_public: bool
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True


class SkillWalletPublicResponse(BaseModel):
    user_name: str
    certifications: List[dict]  # List of passed certifications with scores

    class Config:
        from_attributes = True


# Payment Schemas
class PaymentInitiate(BaseModel):
    certification_id: int


class PaymentResponse(BaseModel):
    id: int
    order_id: str
    amount: float
    currency: str
    payment_method: str
    status: str

    class Config:
        from_attributes = True


class PaymentVerify(BaseModel):
    payment_id: str
    order_id: str
    signature: str  # For Razorpay verification


# Dashboard Schemas
class DashboardResponse(BaseModel):
    available_certifications: List[CertificationResponse]
    in_progress_exams: List[ExamAttemptResponse]
    completed_certifications: List[dict]  # {certification, result, score}
    total_certifications: int
    total_completed: int

    class Config:
        from_attributes = True


# Question with choices for frontend (without correct answer)
class QuestionForExamResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    difficulty: str
    options: Optional[List[str]] = None
    is_practical: bool
    topic: str

    class Config:
        from_attributes = True


# Exam Question Session
class ExamQuestionSession(BaseModel):
    current_question_index: int
    total_questions: int
    current_question: QuestionForExamResponse
    time_remaining_seconds: int
    exam_attempt_id: int


# Rebuild models to resolve forward references
CertificationDetailResponse.model_rebuild()
