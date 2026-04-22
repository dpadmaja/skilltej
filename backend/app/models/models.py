from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Enum, JSON, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


# ============================================================================
# TABLE 1: USERS - Core authentication and user profiles across all products
# ============================================================================
class User(Base):
    """
    Central user table for multi-product platform.
    Stores authentication and core profile info for all products (Certify, Kids, Pro).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Authentication fields
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Basic profile
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Product enrollments (tracks which products user is enrolled in)
    enrolled_products = Column(JSON, default=lambda: [])  # e.g., ["certify", "kids", "pro"]
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships (one user can have multiple profiles in different products)
    certify_profile = relationship("CertifyProfile", back_populates="user", uselist=False)
    kids_profile = relationship("KidsProfile", back_populates="user", uselist=False)
    pro_profile = relationship("ProProfile", back_populates="user", uselist=False)
    
    exam_attempts = relationship("ExamAttempt", back_populates="user")
    skill_wallet = relationship("SkillWallet", back_populates="user", uselist=False)


# ============================================================================
# TABLE 2: PRODUCT_PROFILES - Product-specific user data and preferences
# ============================================================================

class CertifyProfile(Base):
    """Certify product profile - Professional certifications"""
    __tablename__ = "certify_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Certify-specific fields
    expertise_area = Column(String, nullable=True)  # e.g., "AI", "Cloud"
    bio = Column(Text, nullable=True)
    profile_photo_url = Column(String, nullable=True)
    
    # Achievements
    certifications_completed = Column(Integer, default=0)
    total_certifications_earned = Column(JSON, default=lambda: [])
    current_streak = Column(Integer, default=0)
    
    # Preferences
    notification_preferences = Column(JSON, default=lambda: {})
    learning_pace = Column(String, default="moderate")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="certify_profile")


class KidsProfile(Base):
    """Kids product profile - K-12 learning platform"""
    __tablename__ = "kids_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Kids-specific fields
    grade = Column(String)  # e.g., "Grade 5"
    city = Column(String)
    age = Column(Integer, nullable=True)
    
    # Learning progress
    completed_learning_paths = Column(JSON, default=lambda: [])
    active_learning_paths = Column(JSON, default=lambda: [])
    
    # Life Skills tracking
    completed_life_skills = Column(JSON, default=lambda: [])
    subscribed_life_skills = Column(JSON, default=lambda: [])
    
    # Subscriptions
    active_subscriptions = Column(JSON, default=lambda: [])
    total_study_hours = Column(Float, default=0.0)
    current_level = Column(String, default="beginner")
    
    # Parental controls
    parent_email = Column(String, nullable=True)
    daily_limit_minutes = Column(Integer, default=120)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="kids_profile")


class ProProfile(Base):
    """Pro product profile - Professional AI courses and development"""
    __tablename__ = "pro_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Pro-specific fields
    role = Column(String)  # e.g., "Software Developer"
    company = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    years_experience = Column(Integer, nullable=True)
    
    # Course progress
    enrolled_courses = Column(JSON, default=lambda: [])
    completed_courses = Column(JSON, default=lambda: [])
    in_progress_courses = Column(JSON, default=lambda: [])
    
    # Professional development
    active_subscriptions = Column(JSON, default=lambda: [])
    career_goals = Column(Text, nullable=True)
    skills_to_develop = Column(JSON, default=lambda: [])
    
    # Performance metrics
    total_learning_hours = Column(Float, default=0.0)
    average_course_rating = Column(Float, nullable=True)
    certificates_earned = Column(Integer, default=0)
    
    # Social
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="pro_profile")


# ============================================================================
# TABLE 3: LEARNING_CONTENT - All courses, certifications, learning paths
# ============================================================================

class ContentType(str, enum.Enum):
    """Different types of learning content across products"""
    CERTIFICATION = "certification"  # Certify product
    LEARNING_PATH = "learning_path"  # Kids product
    PROFESSIONAL_COURSE = "professional_course"  # Pro product


class LearningContent(Base):
    """Unified content table for all learning materials"""
    __tablename__ = "learning_content"

    id = Column(Integer, primary_key=True, index=True)
    
    # Content identification
    content_type = Column(String, index=True)  # certification, learning_path, professional_course
    product = Column(String, index=True)  # certify, kids, pro
    
    # Basic info
    title = Column(String, index=True)
    description = Column(Text)
    short_description = Column(String, nullable=True)
    
    # Content metadata
    difficulty_level = Column(String, default="Beginner")
    duration_hours = Column(Float)
    category = Column(String, nullable=True)
    subcategory = Column(String, nullable=True)
    
    # For Certify certifications
    passing_score = Column(Float, nullable=True, default=70.0)
    total_questions = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # For Kids learning paths
    target_grade = Column(String, nullable=True)
    learning_objectives = Column(JSON, default=lambda: [])
    
    # For Pro courses
    instructor_name = Column(String, nullable=True)
    instructor_bio = Column(Text, nullable=True)
    students_enrolled = Column(Integer, default=0)
    average_rating = Column(Float, nullable=True)
    course_includes = Column(JSON, default=lambda: [])
    
    # Subscription & pricing
    is_free = Column(Boolean, default=False)
    price = Column(Float, nullable=True)
    subscription_required = Column(Boolean, default=False)
    
    # Content resources
    cover_image_url = Column(String, nullable=True)
    content_modules = Column(JSON, default=lambda: [])
    resources = Column(JSON, default=lambda: {})
    
    # Engagement metrics
    total_enrollments = Column(Integer, default=0)
    completion_rate = Column(Float, nullable=True)
    
    # Administrative
    is_published = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    questions = relationship("Question", back_populates="content")
    exam_attempts = relationship("ExamAttempt", back_populates="content")
    enrollments = relationship("ContentEnrollment", back_populates="content")


# Keep old Certification class for backward compatibility (for now)
class CertificationType(str, enum.Enum):
    AI_QE = "AI for quality engineers"
    GEN_AI = "Gen AI fundamentals"
    AGENTIC_AI = "Agentic AI fundamentals"
    AI_DA = "AI for Data analysts"
    AI_DEV = "AI for software developers"


class Certification(Base):
    """Certification details model - DEPRECATED: Use LearningContent instead"""
    __tablename__ = "certifications"
    __table_args__ = (UniqueConstraint('name', name='uix_cert_name'),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    cert_type = Column(String, index=True)
    duration_minutes = Column(Integer)
    passing_score = Column(Float, default=70.0)
    total_questions = Column(Integer)
    difficulty_level = Column(String, default="Beginner")
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
    
    # Foreign keys - support both old and new schema
    certification_id = Column(Integer, ForeignKey("certifications.id"), nullable=True)  # OLD: for backward compat
    content_id = Column(Integer, ForeignKey("learning_content.id"), nullable=True)  # NEW: unified
    
    question_text = Column(Text)
    question_type = Column(String, default=QuestionType.MULTIPLE_CHOICE)
    difficulty = Column(String, default="medium")
    options = Column(JSON)
    correct_answer = Column(String)
    explanation = Column(Text)
    points = Column(Float, default=1.0)
    is_practical = Column(Boolean, default=False)
    topic = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    certification = relationship("Certification", back_populates="questions")
    content = relationship("LearningContent", back_populates="questions")
    answers = relationship("UserAnswer", back_populates="question")


class ExamAttempt(Base):
    """Exam attempt tracking model"""
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Foreign keys - support both old and new schema
    certification_id = Column(Integer, ForeignKey("certifications.id"), nullable=True)  # OLD: for backward compat
    content_id = Column(Integer, ForeignKey("learning_content.id"), nullable=True)  # NEW: unified
    
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_duration_seconds = Column(Integer)
    is_completed = Column(Boolean, default=False)
    is_submitted = Column(Boolean, default=False)
    total_score = Column(Float, nullable=True)
    passing_score = Column(Float)
    is_passed = Column(Boolean, nullable=True)
    practical_ability = Column(Float, nullable=True)
    debugging_ability = Column(Float, nullable=True)
    efficiency_score = Column(Float, nullable=True)
    attempts_count = Column(Integer, default=1)
    current_question_index = Column(Integer, default=0)
    ip_address = Column(String)
    device_info = Column(JSON)
    tab_switch_count = Column(Integer, default=0)
    copy_paste_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="exam_attempts")
    certification = relationship("Certification", back_populates="exam_attempts")
    content = relationship("LearningContent", back_populates="exam_attempts")
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
    wallet_url = Column(String, unique=True, index=True)
    is_public = Column(Boolean, default=False)
    featured_certifications = Column(JSON, default=lambda: [])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skill_wallet")


class ContentEnrollment(Base):
    """Track user enrollments in courses/learning paths/certifications"""
    __tablename__ = "content_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content_id = Column(Integer, ForeignKey("learning_content.id"))
    
    enrollment_date = Column(DateTime, default=datetime.utcnow)
    completion_date = Column(DateTime, nullable=True)
    
    # Progress tracking
    is_completed = Column(Boolean, default=False)
    progress_percentage = Column(Float, default=0.0)
    last_accessed = Column(DateTime, nullable=True)
    
    # For subscriptions
    subscription_type = Column(String, nullable=True)  # basic, premium, lifetime
    subscription_expiry = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    content = relationship("LearningContent", back_populates="enrollments")


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
