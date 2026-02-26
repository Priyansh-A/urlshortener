import { useState } from 'react';
import { shortenUrl } from '../services/api';
import toast from 'react-hot-toast';
import RateLimitModal from './RateLimitModal';

export default function UrlShortener({ onSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState({ active: false, seconds: 0 });
  const [shortUrl, setShortUrl] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return toast.error('Enter a URL');

    try {
      new URL(url);
    } catch {
      return toast.error('Invalid URL (use http:// or https://)');
    }

    setLoading(true);
    try {
      const data = await shortenUrl(url);
      setShortUrl(`http://localhost:8000/api/${data.alias}`);
      setUrl('');
      if (onSuccess) onSuccess(data);
      toast.success('URL shortened!');
    } catch (error) {
      if (error.isRateLimit || error.response?.status === 429) {
        const seconds = error.retryAfter || error.response?.data?.retry_after_seconds || 60;
        setRateLimit({ active: true, seconds });
        setShowModal(true);
      } else {
        toast.error('Failed to shorten URL');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied!');
  };

  return (
    <>
      <RateLimitModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setRateLimit({ active: false, seconds: 0 });
        }}
        retryAfter={rateLimit.seconds}
      />

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-purple-900 mb-5">Shorten URL</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your link here"
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                disabled={loading || rateLimit.active}
              />
              
              <button
                type="submit"
                disabled={loading || rateLimit.active}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Shortening...' : rateLimit.active ? `Wait ${rateLimit.seconds}s` : 'Shorten'}
              </button>
            </form>

            {shortUrl && (
              <div className="mt-5 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 text-sm truncate font-medium"
                  >
                    {shortUrl}
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-lg transition font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}