import { useEffect, useState } from 'react';
import { Trophy, Heart, TrendingUp, Upload, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Score, UserCharitySelection, Charity, Winner } from '../types';

export function UserDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'scores' | 'charity' | 'winnings'>('scores');
  const [scores, setScores] = useState<Score[]>([]);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charitySelection, setCharitySelection] = useState<UserCharitySelection | null>(null);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    if (profile) {
      fetchScores();
      fetchCharities();
      fetchCharitySelection();
      fetchWinnings();
    }
  }, [profile]);

  const fetchScores = async () => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setScores(data);
    }
  };

  const fetchCharities = async () => {
    const { data } = await supabase
      .from('charities')
      .select('*')
      .order('name');

    if (data) {
      setCharities(data);
    }
  };

  const fetchCharitySelection = async () => {
    const { data } = await supabase
      .from('user_charity_selections')
      .select('*, charity:charities(*)')
      .eq('user_id', profile?.id)
      .maybeSingle();

    if (data) {
      setCharitySelection(data);
      setSelectedCharityId(data.charity_id);
      setPercentage(data.percentage);
    }
  };

  const fetchWinnings = async () => {
    const { data } = await supabase
      .from('winners')
      .select('*, draw:draws(*)')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setWinners(data);
    }
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newScore) return;

    setLoading(true);
    const { error } = await supabase
      .from('scores')
      .insert({
        user_id: profile.id,
        score: parseInt(newScore),
        date_played: newDate,
      });

    if (!error) {
      setNewScore('');
      setNewDate(new Date().toISOString().split('T')[0]);
      await fetchScores();
    }
    setLoading(false);
  };

  const handleSaveCharity = async () => {
    if (!profile || !selectedCharityId) return;

    setLoading(true);
    if (charitySelection) {
      const { error } = await supabase
        .from('user_charity_selections')
        .update({
          charity_id: selectedCharityId,
          percentage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', charitySelection.id);

      if (!error) {
        await fetchCharitySelection();
      }
    } else {
      const { error } = await supabase
        .from('user_charity_selections')
        .insert({
          user_id: profile.id,
          charity_id: selectedCharityId,
          percentage,
        });

      if (!error) {
        await fetchCharitySelection();
      }
    }
    setLoading(false);
  };

  const handleUploadProof = async (winnerId: string) => {
    alert('File upload functionality would be implemented with Supabase Storage');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-blue-100">Welcome back, {profile?.full_name || profile?.email}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Scores</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{scores.length}/5</div>
            <div className="text-sm text-gray-600">Scores submitted</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-500">Charity</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
            <div className="text-sm text-gray-600">Contribution rate</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-gray-500">Winnings</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${winners.reduce((sum, w) => sum + Number(w.prize_amount), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total prizes</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('scores')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'scores'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Score Entry
              </button>
              <button
                onClick={() => setActiveTab('charity')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'charity'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Charity Selection
              </button>
              <button
                onClick={() => setActiveTab('winnings')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'winnings'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Winnings
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'scores' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Add New Score</h3>
                  <form onSubmit={handleAddScore} className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stableford Score
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="72"
                        value={newScore}
                        onChange={(e) => setNewScore(e.target.value)}
                        required
                        placeholder="Enter score"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Played
                      </label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        Add Score
                      </button>
                    </div>
                  </form>
                  {scores.length >= 5 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Adding a new score will replace your oldest score
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Your Scores</h3>
                  {scores.length > 0 ? (
                    <div className="space-y-3">
                      {scores.map((score) => (
                        <div
                          key={score.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                              {score.score}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {score.score} points
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(score.date_played).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No scores submitted yet. Add your first score above!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'charity' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Choose Your Charity
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Charity
                      </label>
                      <select
                        value={selectedCharityId}
                        onChange={(e) => setSelectedCharityId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Choose a charity...</option>
                        {charities.map((charity) => (
                          <option key={charity.id} value={charity.id}>
                            {charity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contribution Percentage: {percentage}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={percentage}
                        onChange={(e) => setPercentage(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>10% (minimum)</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveCharity}
                      disabled={loading || !selectedCharityId}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Save Charity Selection
                    </button>
                  </div>
                </div>

                {charitySelection && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Current Selection</h4>
                    <div className="flex items-start gap-4">
                      {charitySelection.charity?.logo_url && (
                        <img
                          src={charitySelection.charity.logo_url}
                          alt={charitySelection.charity.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {charitySelection.charity?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {charitySelection.percentage}% of your subscription
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'winnings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Your Winnings</h3>
                  {winners.length > 0 ? (
                    <div className="space-y-4">
                      {winners.map((winner) => (
                        <div
                          key={winner.id}
                          className="border border-gray-200 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {winner.match_type.replace('-', ' ').toUpperCase()}
                              </div>
                              <div className="text-sm text-gray-600">
                                {winner.draw?.draw_date && new Date(winner.draw.draw_date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                ${Number(winner.prize_amount).toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Status: </span>
                              <span
                                className={`font-medium ${
                                  winner.verification_status === 'approved'
                                    ? 'text-green-600'
                                    : winner.verification_status === 'rejected'
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }`}
                              >
                                {winner.verification_status.charAt(0).toUpperCase() +
                                  winner.verification_status.slice(1)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment: </span>
                              <span
                                className={`font-medium ${
                                  winner.payment_status === 'completed'
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                }`}
                              >
                                {winner.payment_status.charAt(0).toUpperCase() +
                                  winner.payment_status.slice(1)}
                              </span>
                            </div>
                          </div>

                          {winner.verification_status === 'pending' && !winner.proof_screenshot_url && (
                            <button
                              onClick={() => handleUploadProof(winner.id)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Proof Screenshot
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No winnings yet. Keep playing and good luck in the next draw!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
