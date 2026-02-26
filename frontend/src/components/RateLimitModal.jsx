import { useState, useEffect } from 'react';

// popup for 429 error with time remaining
export default function RateLimitModal({ isOpen, onClose, retryAfter }) {
  const [seconds, setSeconds] = useState(retryAfter);

  useEffect(() => {
    if (isOpen) {
      setSeconds(retryAfter);
    }
  }, [isOpen, retryAfter]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((retryAfter - seconds) / retryAfter) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
            Rate Limit Exceeded
          </h3>

          <p className="text-center text-gray-600 mb-6">
            Too many requests. Please wait before creating more short URLs.
          </p>

          <div className="text-center mb-4">
            <span className="text-4xl font-mono font-bold text-primary-600">
              {formatTime(seconds)}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-center text-sm text-gray-500 mb-6">
            You can make another request in {seconds} second{seconds !== 1 ? 's' : ''}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}