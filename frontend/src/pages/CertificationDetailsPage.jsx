import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Award } from 'lucide-react';
import { certificationService, paymentService } from '../services/api';

function CertificationDetailsPage() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [certification, setCertification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCertification();
  }, [certId]);

  const loadCertification = async () => {
    try {
      const response = await certificationService.getCertificationDetail(certId);
      setCertification(response.data);
    } catch (err) {
      setError('Failed to load certification details');
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
          <p className="text-gray-600">Loading...</p>
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

      {certification && (
        <div>
          <div className="card mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{certification.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{certification.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock size={20} className="text-blue-600" />
                  <span className="font-semibold text-gray-900">Duration</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{certification.duration_minutes} mins</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen size={20} className="text-green-600" />
                  <span className="font-semibold text-gray-900">Questions</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{certification.total_questions}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Award size={20} className="text-purple-600" />
                  <span className="font-semibold text-gray-900">Pass Score</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{certification.passing_score}%</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Certification Details</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Type:</strong> {certification.cert_type}</p>
                <p><strong>Format:</strong> Multiple choice, True/False, and Practical questions</p>
                <p><strong>Difficulty:</strong> Mixed (Easy, Medium, Hard)</p>
                <p><strong>Topics Covered:</strong> Real-world use cases and practical scenarios</p>
              </div>
            </div>

            <div className="border-t mt-6 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What You'll Get</h2>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Official certificate upon passing</li>
                <li>✓ Detailed score breakdown</li>
                <li>✓ Skill assessment (Practical & Debugging ability)</li>
                <li>✓ Shareable skill wallet</li>
                <li>✓ LinkedIn integration for profile updates</li>
              </ul>
            </div>

            <Link
              to={`/payment/${certification.id}`}
              className="btn-primary inline-block mt-8 text-lg"
            >
              Proceed to Payment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificationDetailsPage;
