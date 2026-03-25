import { useState } from 'react';
import { Menu, X, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Trophy className="w-6 h-6" />
              <span>Golf Charity</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`${
                currentPage === 'home'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              } transition-colors`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('charities')}
              className={`${
                currentPage === 'charities'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              } transition-colors`}
            >
              Charities
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className={`${
                currentPage === 'pricing'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-blue-600'
              } transition-colors`}
            >
              Pricing
            </button>

            {user ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`${
                    currentPage === 'dashboard'
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-700 hover:text-blue-600'
                  } transition-colors`}
                >
                  Dashboard
                </button>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`${
                      currentPage === 'admin'
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-700 hover:text-blue-600'
                    } transition-colors`}
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('charities');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Charities
            </button>
            <button
              onClick={() => {
                onNavigate('pricing');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Pricing
            </button>
            {user ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Dashboard
                </button>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onNavigate('auth');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 bg-blue-600 text-white rounded-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
