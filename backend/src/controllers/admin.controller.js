import { supabase } from '../config/supabase.js';

export const listUsers = async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, selected_charity_id, charity_contribution_pct, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ users: data || [] });
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, charityContributionPct, selectedCharityId } = req.body;

    if (charityContributionPct && Number(charityContributionPct) < 10) {
      return res.status(400).json({ message: 'Charity contribution must be at least 10%.' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...(role ? { role } : {}),
        ...(charityContributionPct ? { charity_contribution_pct: Number(charityContributionPct) } : {}),
        ...(selectedCharityId ? { selected_charity_id: selectedCharityId } : {})
      })
      .eq('id', userId)
      .select('id, email, full_name, role, selected_charity_id, charity_contribution_pct')
      .single();

    if (error) throw error;
    return res.json({ user: data });
  } catch (err) {
    return next(err);
  }
};

export const verifyWinnerProof = async (req, res, next) => {
  try {
    const { proofId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved or rejected.' });
    }

    const { data, error } = await supabase
      .from('winner_proofs')
      .update({ status, admin_notes: adminNotes || null, verified_by: req.user.id, verified_at: new Date().toISOString() })
      .eq('id', proofId)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ proof: data });
  } catch (err) {
    return next(err);
  }
};

export const markPayoutCompleted = async (req, res, next) => {
  try {
    const { payoutId } = req.params;

    const { data, error } = await supabase
      .from('payouts')
      .update({ status: 'completed', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', payoutId)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ payout: data });
  } catch (err) {
    return next(err);
  }
};

export const analyticsSummary = async (_req, res, next) => {
  try {
    const [usersResult, subscriptionsResult, payoutsResult, drawResult] = await Promise.all([
      supabase.from('users').select('id, role', { count: 'exact' }),
      supabase.from('subscriptions').select('id, status, amount'),
      supabase.from('payouts').select('id, amount, status'),
      supabase.from('draw_results').select('id, jackpot_amount, jackpot_rollover')
    ]);

    const activeSubs = (subscriptionsResult.data || []).filter((s) => s.status === 'active').length;
    const monthlyRevenue = (subscriptionsResult.data || [])
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const completedPayouts = (payoutsResult.data || []).filter((p) => p.status === 'completed');

    return res.json({
      totalUsers: usersResult.count || 0,
      adminUsers: (usersResult.data || []).filter((u) => u.role === 'admin').length,
      activeSubscriptions: activeSubs,
      monthlyRevenue,
      completedPayoutTotal: completedPayouts.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      pendingPayoutCount: (payoutsResult.data || []).filter((p) => p.status === 'pending').length,
      totalJackpotDistributed: (drawResult.data || []).reduce((sum, d) => sum + Number(d.jackpot_amount || 0), 0),
      currentRolloverPool: Number((drawResult.data || [])[0]?.jackpot_rollover || 0)
    });
  } catch (err) {
    return next(err);
  }
};
