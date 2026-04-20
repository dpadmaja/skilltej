import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Trophy } from 'lucide-react';
import { skillWalletService } from '../services/api';

function PublicSkillWalletPage() {
  const { walletUrl } = useParams();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWallet();
  }, [walletUrl]);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const response = await skillWalletService.getPublicWallet(walletUrl);
      setWallet(response.data);
    } catch (err) {
      setError('Wallet not found or not public');
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
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center mb-6">
          <Trophy size={48} className="mx-auto mb-4 text-yellow-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {wallet.user_name}
          </h1>
          <p className="text-gray-600 text-lg">
            Skilltej Certify - Professional Certification Profile
          </p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {wallet.certifications?.length || 0}
              </div>
              <p className="text-gray-600 text-sm mt-1">Certifications</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                100%
              </div>
              <p className="text-gray-600 text-sm mt-1">Pass Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <CheckCircle className="mr-3 text-green-600" size={28} />
          Verified Certifications
        </h2>

        {wallet.certifications && wallet.certifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallet.certifications.map((cert, idx) => (
              <div
                key={idx}
                className="card border-l-4 border-green-600 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">
                    {cert.name}
                  </h3>
                  <CheckCircle size={24} className="text-green-600 flex-shrink-0 ml-2" />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-2xl font-bold text-green-600">
                      {cert.score?.toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Date Passed</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(cert.passed_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    ✓ Verified by Skilltej Certify Platform
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600">No certifications completed yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-600 text-sm">
        <p>This profile is powered by Skilltej Certify</p>
        <p className="mt-2">Professional Certification Platform for AI and Advanced Technologies</p>
      </div>
    </div>
  );
}

export default PublicSkillWalletPage;
