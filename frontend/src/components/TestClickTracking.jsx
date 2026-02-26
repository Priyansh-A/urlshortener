import { useState } from 'react';
import { accessShortUrl } from '../services/api';
import toast from 'react-hot-toast';

export default function TestClickTracking({ alias, onCounted }) {
  const [loading, setLoading] = useState(false);

  const handleTestClick = async () => {
    setLoading(true);
    try {
      // This will trigger the redirect and count the click
      window.open(`http://localhost:8000/api/${alias}`, '_blank');
      toast.success('Opening link... Click will be counted!');
      
      // Wait a moment then refresh analytics
      setTimeout(() => {
        if (onCounted) onCounted();
      }, 1000);
    } catch (error) {
      toast.error('Failed to access URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleTestClick}
      disabled={loading}
      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
      title="Test this short URL"
    >
      {loading ? '...' : 'Test Link'}
    </button>
  );
}