export default function RecentClicks({ clicks }) {
  if (!clicks || clicks.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No recent clicks</p>
        <p className="text-sm mt-2">Share your short URL to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {clicks.map((click, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-primary-600 font-medium">{click.alias}</span>
          </div>
          <span className="text-gray-500 text-xs">
            {new Date(click.clicked_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}