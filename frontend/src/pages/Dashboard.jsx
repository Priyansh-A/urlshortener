import { useState, useEffect } from 'react';
import UrlList from '../components/UrlList';
import AnalyticsChart from '../components/AnalyticsChart';
import RecentClicks from '../components/RecentClicks';
import { getUrlAnalytics, getAllUrls } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchAllUrls();
  }, [refresh]);

  useEffect(() => {
    if (selectedUrl) {
      fetchAnalytics(selectedUrl.id);
    } else {
      setAnalytics(null);
    }
  }, [selectedUrl]);

  const fetchAllUrls = async () => {
    try {
      const data = await getAllUrls();
      setUrls(data);
    } catch {
      toast.error('Failed to load URLs');
    }
  };

  const fetchAnalytics = async (urlId) => {
    if (!urlId) return;
    
    setLoading(true);
    try {
      const data = await getUrlAnalytics(urlId);
      setAnalytics(data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
    if (selectedUrl) fetchAnalytics(selectedUrl.id);
    toast.success('Refreshed');
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-900">Dashboard</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UrlList
              urls={urls}
              onSelectUrl={setSelectedUrl}
              refresh={refresh}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedUrl ? (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-purple-900">{selectedUrl.alias}</h2>
                      <a href={selectedUrl.url} target="_blank" rel="noopener noreferrer" 
                        className="text-purple-500 hover:text-purple-700 text-sm">
                        {selectedUrl.url}
                      </a>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-purple-600">
                        {analytics?.total_clicks || 0}
                      </span>
                      <p className="text-sm text-gray-500">clicks</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">Last 7 Days</h3>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <AnalyticsChart data={analytics} />
                  )}
                </div>

                {analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">By Alias</h3>
                      <div className="space-y-2">
                        {analytics.clicks_by_alias?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                            <span className="font-mono text-purple-800">{item.alias}</span>
                            <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">Recent</h3>
                      <RecentClicks clicks={analytics?.recent_clicks} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-12 text-center">
                <p className="text-purple-400">Select a URL to view analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}