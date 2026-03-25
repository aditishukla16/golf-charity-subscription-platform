import { useEffect, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Charity } from '../types';

export function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [filteredCharities, setFilteredCharities] = useState<Charity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharities();
  }, []);

  useEffect(() => {
    filterCharities();
  }, [searchTerm, selectedCategory, charities]);

  const fetchCharities = async () => {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching charities:', error);
    } else {
      setCharities(data || []);
    }
    setLoading(false);
  };

  const filterCharities = () => {
    let filtered = charities;

    if (searchTerm) {
      filtered = filtered.filter(
        (charity) =>
          charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          charity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((charity) => charity.category === selectedCategory);
    }

    setFilteredCharities(filtered);
  };

  const categories = Array.from(new Set(charities.map((c) => c.category)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading charities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Our Charities</h1>
          <p className="text-xl text-blue-100">
            Choose a charity that resonates with you and make a difference
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search charities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 text-gray-600">
          Showing {filteredCharities.length} of {charities.length} charities
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharities.map((charity) => (
            <div
              key={charity.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {charity.logo_url && (
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={charity.logo_url}
                    alt={charity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-medium">
                    {charity.category.charAt(0).toUpperCase() + charity.category.slice(1)}
                  </span>
                  {charity.is_featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{charity.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{charity.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Total Received: ${charity.total_received.toFixed(2)}
                  </div>
                  {charity.website && (
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span className="text-sm">Visit</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCharities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No charities found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}
