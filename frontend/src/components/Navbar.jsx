import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
const location = useLocation();

return (
    <nav className="bg-white shadow-sm">
    <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-gray-800">URLShortener</span>
        </Link>
        
        <div className="flex space-x-4">
            <Link
            to="/"
            className={`px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/'
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            >
            Home
            </Link>
            <Link
            to="/dashboard"
            className={`px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/dashboard'
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            >
            Dashboard
            </Link>
        </div>
        </div>
    </div>
    </nav>
);
}