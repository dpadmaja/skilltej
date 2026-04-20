import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { paymentService, examService } from '../services/api';

function PaymentPage() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initiatePayment();
  }, [certId]);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.initiatePayment({ certification_id: parseInt(certId) });
      setPayment(response.data);
    } catch (err) {
      setError('Failed to initiate payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Verify payment (dummy)
      await paymentService.verifyPayment({
        payment_id: `pay_${Date.now()}`,
        order_id: payment.order_id,
        signature: 'dummy_signature'
      });

      setSuccess(true);

      // Start exam after payment
      setTimeout(() => {
        const startExam = async () => {
          try {
            const response = await examService.startExam({
              certification_id: parseInt(certId),
              ip_address: '0.0.0.0',
              device_info: {}
            });
            navigate(`/exam/${response.data.id}`);
          } catch (err) {
            setError('Failed to start exam');
          }
        };
        startExam();
      }, 2000);
    } catch (err) {
      setError('Payment verification failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <p className="text-green-800">Payment successful! Starting exam...</p>
        </div>
      )}

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Proceed to Payment</h1>

        {payment && (
          <div className="space-y-6">
            <div className="border rounded-lg p-6 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold text-gray-900">{payment.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">₹{payment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-semibold text-gray-900">{payment.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="badge-warning">Pending</span>
                </div>
              </div>
            </div>

            {/* Razorpay Dummy Integration */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="mr-2" size={24} />
                Payment Gateway
              </h3>
              <p className="text-gray-700 mb-4">
                In production, this would redirect to Razorpay payment gateway. For demo purposes, click the button below to simulate successful payment.
              </p>
              <button
                onClick={handlePaymentSuccess}
                disabled={success}
                className="btn-success w-full disabled:opacity-50"
              >
                {success ? 'Payment Processing...' : 'Simulate Payment Success (Demo)'}
              </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Demo Note:</strong> This is a demonstration payment flow. In production, this would integrate with Razorpay's actual payment gateway for secure payment processing.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;
