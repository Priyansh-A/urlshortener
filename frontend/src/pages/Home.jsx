import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UrlShortener from '../components/UrlShortener';

export default function Home() {
  const navigate = useNavigate();
  const [shortenedUrl, setShortenedUrl] = useState(null);

  const handleSuccess = (data) => {
    setShortenedUrl(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              URL Shortener
            </h1>
            <p className="text-xl text-gray-600">
              Create short trackable urls
            </p>
          </div>

          <UrlShortener onSuccess={handleSuccess} />
          {shortenedUrl && (
            <div className="mt-8 text-center">
            </div>
          )}
        </div>
      </div>
    </div>
  );
}