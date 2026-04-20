from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.models.models import User, ExamAttempt, UserAnswer, Question, Certification
import os
from dotenv import load_dotenv

load_dotenv()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def hash_password(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Convert sub to string if it's an integer (PyJWT requirement)
    if "sub" in to_encode and isinstance(to_encode["sub"], int):
        to_encode["sub"] = str(to_encode["sub"])
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        # Convert string user_id back to integer
        try:
            user_id = int(user_id_str)
            return user_id
        except ValueError:
            return None
    except JWTError:
        return None
    except Exception:
        return None


class AuthService:
    """Authentication service"""

    @staticmethod
    def create_user(db: Session, email: str, username: str, password: str, full_name: str, 
                   grade: str = None, city: str = None, role: str = None):
        """Create new user"""
        # Check if user exists
        existing_user = db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first()

        if existing_user:
            return None

        hashed_password = hash_password(password)
        user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            full_name=full_name,
            is_active=True,
            grade=grade,
            city=city,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        """Authenticate user"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()


class ExamService:
    """Exam service for exam management"""

    @staticmethod
    def start_exam(db: Session, user_id: int, certification_id: int, ip_address: str, device_info: dict = None):
        """Start a new exam attempt"""
        # Check if certification exists
        cert = db.query(Certification).filter(Certification.id == certification_id).first()
        if not cert:
            return None

        # Check if user has already passed this certification
        passed_attempt = db.query(ExamAttempt).filter(
            ExamAttempt.user_id == user_id,
            ExamAttempt.certification_id == certification_id,
            ExamAttempt.is_passed == True
        ).first()

        # Determine attempts count
        attempts = db.query(ExamAttempt).filter(
            ExamAttempt.user_id == user_id,
            ExamAttempt.certification_id == certification_id,
            ExamAttempt.is_submitted == True
        ).count()

        exam_attempt = ExamAttempt(
            user_id=user_id,
            certification_id=certification_id,
            start_time=datetime.utcnow(),
            total_duration_seconds=cert.duration_minutes * 60,
            passing_score=cert.passing_score,
            ip_address=ip_address,
            device_info=device_info,
            attempts_count=attempts + 1
        )
        db.add(exam_attempt)
        db.commit()
        db.refresh(exam_attempt)
        return exam_attempt

    @staticmethod
    def get_exam_attempt(db: Session, exam_attempt_id: int):
        """Get exam attempt details"""
        return db.query(ExamAttempt).filter(ExamAttempt.id == exam_attempt_id).first()

    @staticmethod
    def get_current_question(db: Session, exam_attempt_id: int):
        """Get current question for exam"""
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == exam_attempt_id).first()
        if not attempt:
            return None

        questions = db.query(Question).filter(
            Question.certification_id == attempt.certification_id
        ).all()

        if attempt.current_question_index >= len(questions):
            return None

        return questions[attempt.current_question_index]

    @staticmethod
    def submit_answer(db: Session, exam_attempt_id: int, question_id: int, user_answer: str, time_taken_seconds: int):
        """Submit an answer to a question"""
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            return None

        # Check if answer is correct
        is_correct = question.correct_answer.lower() == user_answer.lower()

        user_answer_obj = UserAnswer(
            exam_attempt_id=exam_attempt_id,
            question_id=question_id,
            user_answer=user_answer,
            is_correct=is_correct,
            time_taken_seconds=time_taken_seconds,
            score_obtained=question.points if is_correct else 0.0
        )
        db.add(user_answer_obj)
        db.commit()
        db.refresh(user_answer_obj)
        return user_answer_obj

    @staticmethod
    def next_question(db: Session, exam_attempt_id: int):
        """Move to next question"""
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == exam_attempt_id).first()
        if not attempt:
            return None

        questions = db.query(Question).filter(
            Question.certification_id == attempt.certification_id
        ).all()

        if attempt.current_question_index < len(questions) - 1:
            attempt.current_question_index += 1
            db.commit()

        return attempt

    @staticmethod
    def previous_question(db: Session, exam_attempt_id: int):
        """Move to previous question"""
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == exam_attempt_id).first()
        if not attempt:
            return None

        if attempt.current_question_index > 0:
            attempt.current_question_index -= 1
            db.commit()

        return attempt

    @staticmethod
    def mark_exam_complete(db: Session, exam_attempt_id: int):
        """Mark exam as complete (ready for submission)"""
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == exam_attempt_id).first()
        if not attempt:
            return None

        attempt.is_completed = True
        db.commit()
        db.refresh(attempt)
        return attempt

    @staticmethod
    def submit_exam(db: Session, exam_attempt_id: int):
        """Submit exam and evaluate results"""
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == exam_attempt_id).first()
        if not attempt:
            return None

        attempt.end_time = datetime.utcnow()
        attempt.is_submitted = True

        # Calculate scores
        answers = db.query(UserAnswer).filter(UserAnswer.exam_attempt_id == exam_attempt_id).all()
        total_score = sum(answer.score_obtained for answer in answers)

        attempt.total_score = total_score
        attempt.is_passed = total_score >= attempt.passing_score

        # Calculate ability scores
        practical_answers = db.query(UserAnswer).join(Question).filter(
            UserAnswer.exam_attempt_id == exam_attempt_id,
            Question.is_practical == True
        ).all()

        if practical_answers:
            correct_practical = sum(1 for a in practical_answers if a.is_correct)
            attempt.practical_ability = (correct_practical / len(practical_answers)) * 100
        else:
            attempt.practical_ability = 0.0

        # Debugging ability based on hard questions
        hard_questions = db.query(UserAnswer).join(Question).filter(
            UserAnswer.exam_attempt_id == exam_attempt_id,
            Question.difficulty == "hard"
        ).all()

        if hard_questions:
            correct_hard = sum(1 for a in hard_questions if a.is_correct)
            attempt.debugging_ability = (correct_hard / len(hard_questions)) * 100
        else:
            attempt.debugging_ability = 0.0

        # Calculate efficiency score (based on time remaining)
        time_taken = (attempt.end_time - attempt.start_time).total_seconds()
        efficiency = max(0, ((attempt.total_duration_seconds - time_taken) / attempt.total_duration_seconds) * 100)
        attempt.efficiency_score = efficiency

        db.commit()
        db.refresh(attempt)
        return attempt


class AntiCheatService:
    """Service for anti-cheating measures"""

    @staticmethod
    def record_tab_switch(db: Session, exam_attempt_id: int):
        """Record tab switch event"""
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == exam_attempt_id).first()
        if attempt:
            attempt.tab_switch_count += 1
            db.commit()

    @staticmethod
    def record_copy_paste(db: Session, exam_attempt_id: int):
        """Record copy-paste event"""
        attempt = db.query(ExamAttempt).filter(ExamAttempt.id == exam_attempt_id).first()
        if attempt:
            attempt.copy_paste_count += 1
            db.commit()

    @staticmethod
    def get_cheating_score(attempt: ExamAttempt) -> float:
        """Calculate cheating risk score (0-100, higher = more suspicious)"""
        risk_score = 0

        # Tab switching
        if attempt.tab_switch_count > 3:
            risk_score += min(30, attempt.tab_switch_count * 5)

        # Copy paste
        if attempt.copy_paste_count > 2:
            risk_score += min(30, attempt.copy_paste_count * 10)

        # Time analysis - too fast is suspicious
        time_taken = (attempt.end_time - attempt.start_time).total_seconds() if attempt.end_time else attempt.total_duration_seconds
        avg_time_per_question = time_taken / attempt.certification.total_questions if attempt.certification else 0
        if avg_time_per_question < 10:  # Less than 10 seconds per question
            risk_score += 20

        return min(100, risk_score)
