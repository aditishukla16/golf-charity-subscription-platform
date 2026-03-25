import { useEffect, useState } from 'react';
import { Users, Trophy, Heart, TrendingUp, Plus, Play, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile, Score, Charity, Draw, Winner } from '../types';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'charities' | 'draws' | 'winners'>('analytics');
  const [users, setUsers] = useState<Profile[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeSubscribers: 0, totalPrizePool: 0, totalCharity: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'analytics') {
      await fetchStats();
    } else if (activeTab === 'users') {
      await fetchUsers();
    } else if (activeTab === 'charities') {
      await fetchCharities();
    } else if (activeTab === 'draws') {
      await fetchDraws();
    } else if (activeTab === 'winners') {
      await fetchWinners();
    }
  };

  const fetchStats = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: drawsData } = await supabase.from('draws').select('*');
    const { data: charitiesData } = await supabase.from('charities').select('total_received');

    setStats({
      totalUsers: profiles?.length || 0,
      activeSubscribers: profiles?.filter(p => p.subscription_status === 'active').length || 0,
      totalPrizePool: drawsData?.reduce((sum, d) => sum + Number(d.total_prize_pool), 0) || 0,
      totalCharity: charitiesData?.reduce((sum, c) => sum + Number(c.total_received), 0) || 0,
    });
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*').order('name');
    if (data) setCharities(data);
  };

  const fetchDraws = async () => {
    const { data } = await supabase.from('draws').select('*').order('draw_date', { ascending: false });
    if (data) setDraws(data);
  };

  const fetchWinners = async () => {
    const { data } = await supabase
      .from('winners')
      .select('*, profile:profiles(email, full_name), draw:draws(draw_date)')
      .order('created_at', { ascending: false });
    if (data) setWinners(data);
  };

  const handleRunDraw = async () => {
    if (!confirm('Are you sure you want to run a new draw? This will create winners based on submitted scores.')) {
      return;
    }

    setLoading(true);
    const winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 72) + 1);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { error } = await supabase.from('draws').insert({
      draw_month: currentMonth,
      draw_date: new Date().toISOString().split('T')[0],
      winning_numbers: winningNumbers,
      total_prize_pool: 1000,
      is_published: false,
    });

    if (!error) {
      alert('Draw created successfully! Review and publish it.');
      await fetchDraws();
    }
    setLoading(false);
  };

  const handlePublishDraw = async (drawId: string) => {
    const { error } = await supabase
      .from('draws')
      .update({ is_published: true })
      .eq('id', drawId);

    if (!error) {
      alert('Draw published successfully!');
      await fetchDraws();
    }
  };

  const handleVerifyWinner = async (winnerId: string, approved: boolean) => {
    const { error } = await supabase
      .from('winners')
      .update({
        verification_status: approved ? 'approved' : 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', winnerId);

    if (!error) {
      alert(`Winner ${approved ? 'approved' : 'rejected'} successfully!`);
      await fetchWinners();
    }
  };

  const handleMarkPaid = async (winnerId: string) => {
    const { error } = await supabase
      .from('winners')
      .update({
        payment_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', winnerId);

    if (!error) {
      alert('Payment marked as completed!');
      await fetchWinners();
    }
  };

  const handleAddCharity = async () => {
    const name = prompt('Charity name:');
    const description = prompt('Description:');
    const category = prompt('Category:');

    if (!name || !description || !category) return;

    setLoading(true);
    const { error } = await supabase.from('charities').insert({
      name,
      description,
      category,
      is_featured: false,
    });

    if (!error) {
      alert('Charity added successfully!');
      await fetchCharities();
    }
    setLoading(false);
  };

  const handleToggleFeatured = async (charityId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('charities')
      .update({ is_featured: !currentStatus })
      .eq('id', charityId);

    if (!error) {
      await fetchCharities();
    }
  };

  const handleUpdateSubscription = async (userId: string, status: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (!error) {
      alert('Subscription updated!');
      await fetchUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage platform operations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['analytics', 'users', 'charities', 'draws', 'winners'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-6 py-4 font-medium whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                    <Trophy className="w-8 h-8 text-green-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900">{stats.activeSubscribers}</div>
                    <div className="text-sm text-gray-600">Active Subscribers</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl border border-orange-100">
                    <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900">${stats.totalPrizePool.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Total Prize Pool</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-xl border border-pink-100">
                    <Heart className="w-8 h-8 text-pink-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900">${stats.totalCharity.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Charity Contributions</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subscription</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 py-3 text-sm">{user.full_name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.subscription_status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.subscription_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleUpdateSubscription(
                                user.id,
                                user.subscription_status === 'active' ? 'inactive' : 'active'
                              )}
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              Toggle Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'charities' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Charity Management</h2>
                  <button
                    onClick={handleAddCharity}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Charity
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {charities.map((charity) => (
                    <div key={charity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{charity.name}</h3>
                          <p className="text-sm text-gray-600">{charity.category}</p>
                        </div>
                        <button
                          onClick={() => handleToggleFeatured(charity.id, charity.is_featured)}
                          className={`text-xs px-2 py-1 rounded ${
                            charity.is_featured
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {charity.is_featured ? 'Featured' : 'Not Featured'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{charity.description}</p>
                      <div className="text-sm text-gray-500">
                        Total Received: ${charity.total_received.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'draws' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Draw Management</h2>
                  <button
                    onClick={handleRunDraw}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    Run New Draw
                  </button>
                </div>
                <div className="space-y-4">
                  {draws.map((draw) => (
                    <div key={draw.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {new Date(draw.draw_date).toLocaleDateString()}
                          </h3>
                          <p className="text-sm text-gray-600">Month: {draw.draw_month}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          draw.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {draw.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="text-sm mb-2">
                        <span className="text-gray-600">Winning Numbers: </span>
                        <span className="font-mono font-semibold">{draw.winning_numbers.join(', ')}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Prize Pool: ${Number(draw.total_prize_pool).toFixed(2)}
                      </div>
                      {!draw.is_published && (
                        <button
                          onClick={() => handlePublishDraw(draw.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Publish Draw
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'winners' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Winner Verification</h2>
                <div className="space-y-4">
                  {winners.map((winner) => (
                    <div key={winner.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {winner.profile?.full_name || winner.profile?.email}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {winner.match_type} - ${Number(winner.prize_amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Draw Date: {winner.draw?.draw_date && new Date(winner.draw.draw_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium block mb-1 ${
                            winner.verification_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : winner.verification_status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {winner.verification_status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium block ${
                            winner.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {winner.payment_status}
                          </span>
                        </div>
                      </div>
                      {winner.verification_status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleVerifyWinner(winner.id, true)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyWinner(winner.id, false)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                      {winner.verification_status === 'approved' && winner.payment_status === 'pending' && (
                        <button
                          onClick={() => handleMarkPaid(winner.id)}
                          className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
