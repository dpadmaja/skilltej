import React, { useState, useEffect } from 'react';
import { Share2, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import { skillWalletService } from '../services/api';

function SkillWalletPage({ user }) {
  const [wallet, setWallet] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWallet();
  }, [user.id]);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const response = await skillWalletService.getWalletDetails();
      setWallet(response.data);
      setIsPublic(response.data.is_public);
    } catch (err) {
      setError('Failed to load skill wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      const response = await skillWalletService.togglePublic();
      setWallet(response.data);
      setIsPublic(response.data.is_public);
    } catch (err) {
      setError('Failed to update wallet visibility');
    }
  };

  const copyToClipboard = () => {
    if (wallet?.public_link) {
      const fullUrl = `${window.location.origin}/skill-wallet/${wallet.wallet_url}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToLinkedIn = () => {
    if (wallet?.public_link) {
      const fullUrl = `${window.location.origin}/skill-wallet/${wallet.wallet_url}`;
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
      window.open(linkedInUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Skill Wallet</h1>
        <p className="text-gray-600">Showcase your certifications and share your achievements</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {wallet && (
        <div>
          {/* Wallet Visibility Control */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Wallet Visibility</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <p className="font-semibold text-gray-900">
                  {isPublic ? '🔓 Public' : '🔒 Private'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isPublic
                    ? 'Your skill wallet is visible to everyone with the link'
                    : 'Your skill wallet is private and only visible to you'}
                </p>
              </div>
              <button
                onClick={handleTogglePublic}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isPublic
                    ? 'btn-danger'
                    : 'btn-success'
                }`}
              >
                {isPublic ? 'Make Private' : 'Make Public'}
              </button>
            </div>
          </div>

          {/* Share Section */}
          {isPublic && (
            <div className="card mb-8 bg-blue-50 border border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Share2 size={24} className="mr-2 text-blue-600" />
                Share Your Achievements
              </h2>

              <div className="space-y-4">
                {/* Share Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Wallet Link
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/skill-wallet/${wallet.wallet_url}`}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 btn-secondary"
                    >
                      {copied ? (
                        <>
                          <CheckCircle size={18} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share On Social Media
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={shareToLinkedIn}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Share2 size={18} />
                      <span>Share on LinkedIn</span>
                    </button>
                    <button
                      onClick={() => {
                        const text = `Check out my Skilltej Certify achievements!`;
                        const url = `${window.location.origin}/skill-wallet/${wallet.wallet_url}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
                    >
                      <Share2 size={18} />
                      <span>Share on Twitter</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-gray-700">
                <strong>Make Your Wallet Public:</strong> Toggle the visibility above to share your certifications
              </li>
              <li className="text-gray-700">
                <strong>Copy Your Link:</strong> Share the unique URL with anyone to showcase your achievements
              </li>
              <li className="text-gray-700">
                <strong>Social Media Sharing:</strong> Directly share to LinkedIn, Twitter, and other platforms
              </li>
              <li className="text-gray-700">
                <strong>Professional Profile:</strong> Let employers and peers verify your Skilltej Certify credentials
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillWalletPage;
