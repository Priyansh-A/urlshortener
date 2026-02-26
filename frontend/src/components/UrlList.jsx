import { useState } from 'react';
import TestClickTracking from './TestClickTracking';

export default function UrlList({ urls, onSelectUrl, refresh, onUrlClick }) {
  const [selectedAlias, setSelectedAlias] = useState(null);

  const handleSelect = (url) => {
    console.log('Selected URL with ID:', url.id, url.alias); // Debug log
    setSelectedAlias(url.alias);
    onSelectUrl(url); // This should pass the entire URL object with id
  };

  const handleCopyClick = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`http://localhost:8000/api/${text}`);
    alert('Copied to clipboard!');
  };

  const handleClickCounted = () => {
    if (onUrlClick) onUrlClick();
  };

  if (!urls || urls.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Your Shortened URLs</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No URLs shortened yet. Create your first one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Your Shortened URLs</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {urls.map((url) => (
          <div
            key={url.alias}
            onClick={() => handleSelect(url)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedAlias === url.alias
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-primary-600">
                  /{url.alias}
                </span>
                <div className="flex space-x-1">
                  <TestClickTracking 
                    alias={url.alias} 
                    onCounted={handleClickCounted}
                  />
                  <button
                    onClick={(e) => handleCopyClick(e, url.alias)}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    title="Copy short URL"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {url.click_count || 0} clicks
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{url.url}</p>
            <p className="text-xs text-gray-400 mt-2">
              ID: {url.id} | Created: {new Date(url.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}