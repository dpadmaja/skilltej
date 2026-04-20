from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


class User(Base):
    """User model for authentication and profile management"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Product-specific fields (optional, for Kids product)
    grade = Column(String, nullable=True)  # e.g., "Grade 5"
    city = Column(String, nullable=True)
    
    # Product-specific fields (optional, for Pro product)
    role = Column(String, nullable=True)  # e.g., "Software Developer"
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    exam_attempts = relationship("ExamAttempt", back_populates="user")
    skill_wallet = relationship("SkillWallet", back_populates="user", uselist=False)


class CertificationType(str, enum.Enum):
    AI_QE = "AI for quality engineers"
    GEN_AI = "Gen AI fundamentals"
    AGENTIC_AI = "Agentic AI fundamentals"
    AI_DA = "AI for Data analysts"
    AI_DEV = "AI for software developers"


class Certification(Base):
    """Certification details model"""
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    cert_type = Column(String, index=True)
    duration_minutes = Column(Integer)  # Total exam duration
    passing_score = Column(Float, default=70.0)
    total_questions = Column(Integer)
    difficulty_level = Column(String, default="Beginner")  # Beginner, Intermediate, Expert
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    questions = relationship("Question", back_populates="certification")
    exam_attempts = relationship("ExamAttempt", back_populates="certification")


class QuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
    PRACTICAL = "practical"


class Question(Base):
    """Question model with support for various question types"""
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    certification_id = Column(Integer, ForeignKey("certifications.id"))
    question_text = Column(Text)
    question_type = Column(String, default=QuestionType.MULTIPLE_CHOICE)
    difficulty = Column(String, default="medium")  # easy, medium, hard
    options = Column(JSON)  # For MCQ/True-False
    correct_answer = Column(String)  # Can be index or text
    explanation = Column(Text)
    points = Column(Float, default=1.0)
    is_practical = Column(Boolean, default=False)
    topic = Column(String)  # For categorization
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    certification = relationship("Certification", back_populates="questions")
    answers = relationship("UserAnswer", back_populates="question")


class ExamAttempt(Base):
    """Exam attempt tracking model"""
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    certification_id = Column(Integer, ForeignKey("certifications.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_duration_seconds = Column(Integer)
    is_completed = Column(Boolean, default=False)
    is_submitted = Column(Boolean, default=False)
    total_score = Column(Float, nullable=True)
    passing_score = Column(Float)
    is_passed = Column(Boolean, nullable=True)
    practical_ability = Column(Float, nullable=True)  # 0-100
    debugging_ability = Column(Float, nullable=True)  # 0-100
    efficiency_score = Column(Float, nullable=True)  # Based on time taken
    attempts_count = Column(Integer, default=1)
    current_question_index = Column(Integer, default=0)
    ip_address = Column(String)  # For anti-cheating
    device_info = Column(JSON)  # For anti-cheating
    tab_switch_count = Column(Integer, default=0)  # Anti-cheating metric
    copy_paste_count = Column(Integer, default=0)  # Anti-cheating metric
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="exam_attempts")
    certification = relationship("Certification", back_populates="exam_attempts")
    answers = relationship("UserAnswer", back_populates="exam_attempt")


class UserAnswer(Base):
    """User's answers during exam"""
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    exam_attempt_id = Column(Integer, ForeignKey("exam_attempts.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_answer = Column(Text)  # The answer provided
    is_correct = Column(Boolean, nullable=True)
    score_obtained = Column(Float, default=0.0)
    time_taken_seconds = Column(Integer)
    answered_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    exam_attempt = relationship("ExamAttempt", back_populates="answers")
    question = relationship("Question", back_populates="answers")


class SkillWallet(Base):
    """Skill wallet for sharing certifications"""
    __tablename__ = "skill_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    wallet_url = Column(String, unique=True, index=True)  # Unique URL for sharing
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skill_wallet")


class PaymentTransaction(Base):
    """Payment transaction tracking"""
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    certification_id = Column(Integer, ForeignKey("certifications.id"))
    amount = Column(Float)
    currency = Column(String, default="INR")
    payment_method = Column(String, default="razorpay")
    order_id = Column(String)  # Razorpay order ID
    payment_id = Column(String, nullable=True)  # Razorpay payment ID
    status = Column(String, default="pending")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
