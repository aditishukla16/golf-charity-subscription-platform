import { Trophy, Heart, TrendingUp, Users, Gift, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Charity } from '../types';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [featuredCharities, setFeaturedCharities] = useState<Charity[]>([]);

  useEffect(() => {
    fetchFeaturedCharities();
  }, []);

  const fetchFeaturedCharities = async () => {
    const { data } = await supabase
      .from('charities')
      .select('*')
      .eq('is_featured', true)
      .limit(3);

    if (data) {
      setFeaturedCharities(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Play Golf, Win Prizes, Support Charities
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 leading-relaxed">
              Submit your Stableford scores, enter monthly draws, and give back to causes you care about
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('pricing')}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
              <button
                onClick={() => onNavigate('charities')}
                className="bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all border-2 border-white/20"
              >
                View Charities
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, transparent, and rewarding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Submit Your Scores</h3>
              <p className="text-gray-600 leading-relaxed">
                Record your last 5 Stableford scores and automatically enter monthly draws with your best performances
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Charity</h3>
              <p className="text-gray-600 leading-relaxed">
                Select a charity and decide what percentage of your subscription goes directly to them (minimum 10%)
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Win Monthly Prizes</h3>
              <p className="text-gray-600 leading-relaxed">
                Participate in monthly draws with match-based prizes. Higher matches mean bigger winnings
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Join Golf Charity?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <TrendingUp className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Track Performance</h4>
              <p className="text-gray-600">Monitor your golf improvement with score tracking</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Users className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Growing Community</h4>
              <p className="text-gray-600">Join golfers supporting great causes together</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Shield className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Transparent System</h4>
              <p className="text-gray-600">See exactly where contributions go and how draws work</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Heart className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Make Impact</h4>
              <p className="text-gray-600">Your subscription directly supports worthy charities</p>
            </div>
          </div>
        </div>
      </section>

      {featuredCharities.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Featured Charities
              </h2>
              <p className="text-xl text-gray-600">
                Support organizations making a real difference
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredCharities.map((charity) => (
                <div
                  key={charity.id}
                  className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  onClick={() => onNavigate('charities')}
                >
                  {charity.logo_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={charity.logo_url}
                        alt={charity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-blue-600 font-medium mb-2">{charity.category}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{charity.name}</h3>
                    <p className="text-gray-600 line-clamp-2">{charity.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => onNavigate('charities')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All Charities →
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join today and start making a difference with every round you play
          </p>
          <button
            onClick={() => onNavigate('pricing')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
          >
            View Pricing Plans
          </button>
        </div>
      </section>
    </div>
  );
}
