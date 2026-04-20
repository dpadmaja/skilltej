import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { examService } from '../services/api';

function ResultsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, [examId]);

  const loadResults = async () => {
    try {
      const response = await examService.submitExam(examId, { confirm_submit: true });
      setResult(response.data);
    } catch (err) {
      setError('Failed to load results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div>
          {/* Results Header */}
          <div className={`card mb-8 text-center py-12 ${result.is_passed ? 'border-l-4 border-green-600' : 'border-l-4 border-red-600'}`}>
            {result.is_passed ? (
              <>
                <Trophy size={64} className="mx-auto mb-4 text-green-600" />
                <h1 className="text-4xl font-bold text-green-600 mb-2">Congratulations!</h1>
                <p className="text-gray-600 text-lg mb-4">You have successfully passed the certification</p>
              </>
            ) : (
              <>
                <XCircle size={64} className="mx-auto mb-4 text-red-600" />
                <h1 className="text-4xl font-bold text-red-600 mb-2">Not Passed</h1>
                <p className="text-gray-600 text-lg mb-4">You didn't meet the passing score. Try again!</p>
              </>
            )}
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.total_score?.toFixed(1)}%
              </div>
              <p className="text-gray-600">Your Score</p>
              <hr className="my-4" />
              <p className="text-sm text-gray-500">Pass Score: {result.passing_score}%</p>
            </div>

            <div className="card text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {result.practical_ability?.toFixed(1)}%
              </div>
              <p className="text-gray-600">Practical Ability</p>
              <p className="text-xs text-gray-500 mt-2">How well you solved practical problems</p>
            </div>

            <div className="card text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {result.debugging_ability?.toFixed(1)}%
              </div>
              <p className="text-gray-600">Debugging Ability</p>
              <p className="text-xs text-gray-500 mt-2">Problem-solving in difficult scenarios</p>
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Efficiency Score</h2>
                <p className="text-gray-600 text-sm">Based on time taken relative to total duration</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">
                  {result.efficiency_score?.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  Time: {Math.floor(result.total_duration_seconds / 60)} mins
                </p>
              </div>
            </div>
          </div>

          {/* Exam Summary */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Exam Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-semibold text-gray-900">{result.answers?.length || 0}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Correct Answers</span>
                <span className="font-semibold text-green-600">
                  {result.answers?.filter(a => a.is_correct).length || 0}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Wrong Answers</span>
                <span className="font-semibold text-red-600">
                  {result.answers?.filter(a => !a.is_correct).length || 0}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Attempts</span>
                <span className="font-semibold text-gray-900">{result.attempts_count}</span>
              </div>
            </div>
          </div>

          {/* Answer Review */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Answer Review</h2>
            <div className="space-y-4">
              {result.answers?.map((answer, idx) => (
                <div
                  key={idx}
                  className={`p-4 border rounded-lg ${
                    answer.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-900">Question {idx + 1}</span>
                    {answer.is_correct ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Your Answer:</strong> {answer.user_answer}
                  </div>
                  <div className="text-xs text-gray-600">
                    Time: {answer.time_taken_seconds} seconds | Points: {answer.score_obtained}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Link
              to="/skill-wallet"
              className="btn-success flex-1 text-center"
            >
              View Skill Wallet
            </Link>
            <Link
              to="/dashboard"
              className="btn-primary flex-1 text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
