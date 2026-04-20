import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { examService } from '../services/api';

function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);

  useEffect(() => {
    loadCurrentQuestion();
  }, [examId]);

  useEffect(() => {
    if (!timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    // Log tab switches for anti-cheating
    const handleVisibilityChange = () => {
      if (document.hidden && examId) {
        examService.logTabSwitch(examId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [examId]);

  const loadCurrentQuestion = async () => {
    try {
      setLoading(true);
      const response = await examService.getCurrentQuestion(examId);
      setCurrentQuestion(response.data);
      setTimeRemaining(response.data.time_remaining_seconds);
      setSelectedAnswer(null);
    } catch (err) {
      setError('Failed to load question');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) {
      setError('Please select an answer');
      return;
    }

    try {
      const timeSpent = currentQuestion.time_remaining_seconds - timeRemaining;
      await examService.submitAnswer(examId, {
        question_id: currentQuestion.current_question.id,
        user_answer: selectedAnswer,
        time_taken_seconds: timeSpent
      });
      setSelectedAnswer(null);
    } catch (err) {
      setError('Failed to submit answer');
    }
  };

  const handleNextQuestion = async () => {
    await handleAnswerSubmit();
    try {
      await examService.nextQuestion(examId);
      await loadCurrentQuestion();
    } catch (err) {
      setError('Failed to load next question');
    }
  };

  const handlePreviousQuestion = async () => {
    try {
      await examService.previousQuestion(examId);
      await loadCurrentQuestion();
    } catch (err) {
      setError('Failed to load previous question');
    }
  };

  const handleCompleteExam = async () => {
    try {
      await examService.markComplete(examId);
      setExamCompleted(true);
    } catch (err) {
      setError('Failed to complete exam');
    }
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      const response = await examService.submitExam(examId, { confirm_submit: true });
      navigate(`/results/${examId}`);
    } catch (err) {
      setError('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await examService.markComplete(examId);
      await examService.submitExam(examId, { confirm_submit: true });
      navigate(`/results/${examId}`);
    } catch (err) {
      console.error('Auto submit failed', err);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (showConfirmSubmit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Exam?</h2>
          <p className="text-gray-600 mb-8">
            Are you sure you want to submit your exam? You won't be able to change your answers after submission.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowConfirmSubmit(false)}
              className="btn-secondary flex-1"
            >
              No, Continue
            </button>
            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header with Timer */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Exam in Progress</h1>
          <p className="text-blue-100">Question {currentQuestion?.current_question_index + 1} of {currentQuestion?.total_questions}</p>
        </div>
        <div className="text-center">
          <Clock size={32} className="mx-auto mb-2" />
          <div className={`text-4xl font-bold ${timeRemaining <= 300 ? 'text-red-400' : ''}`}>
            {timeRemaining !== null ? formatTime(timeRemaining) : '00:00:00'}
          </div>
          <p className="text-blue-100 text-sm">Time Remaining</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {currentQuestion && (
        <div className="card mb-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex-1">
                {currentQuestion.current_question.question_text}
              </h2>
              <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full ml-4">
                {currentQuestion.current_question.difficulty}
              </span>
            </div>

            {currentQuestion.current_question.is_practical && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 text-sm text-amber-800">
                ⚠️ This is a practical question. Provide a code snippet or detailed explanation.
              </div>
            )}
          </div>

          {/* Options */}
          {currentQuestion.current_question.question_type === 'multiple_choice' && (
            <div className="space-y-3 mb-8">
              {currentQuestion.current_question.options?.map((option, idx) => (
                <label
                  key={idx}
                  className={`block p-4 border rounded-lg cursor-pointer transition ${
                    selectedAnswer === idx.toString()
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={idx.toString()}
                    checked={selectedAnswer === idx.toString()}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.current_question.question_type === 'true_false' && (
            <div className="space-y-3 mb-8">
              {['true', 'false'].map((option) => (
                <label
                  key={option}
                  className={`block p-4 border rounded-lg cursor-pointer transition ${
                    selectedAnswer === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900 capitalize">{option}</span>
                </label>
              ))}
            </div>
          )}

          {(currentQuestion.current_question.question_type === 'short_answer' ||
            currentQuestion.current_question.question_type === 'practical') && (
            <textarea
              value={selectedAnswer || ''}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-8"
              rows={4}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion.current_question_index === 0}
              className="flex items-center space-x-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="flex space-x-4">
              {currentQuestion.current_question_index === currentQuestion.total_questions - 1 ? (
                <>
                  <button
                    onClick={handleCompleteExam}
                    className="btn-success"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    disabled={!examCompleted}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Exam
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamPage;
