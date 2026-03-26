import { supabase } from '../config/supabase.js';

export const listMyWinnings = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*, draw_results(draw_month, jackpot_amount, is_published), winner_proofs(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ winnings: data || [] });
  } catch (err) {
    return next(err);
  }
};

export const submitWinnerProof = async (req, res, next) => {
  try {
    const { payoutId, proofUrl } = req.body;
    if (!payoutId || !proofUrl) {
      return res.status(400).json({ message: 'payoutId and proofUrl are required.' });
    }

    const { data: payout } = await supabase
      .from('payouts')
      .select('id, user_id')
      .eq('id', payoutId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!payout) return res.status(404).json({ message: 'Payout not found.' });

    const { data, error } = await supabase
      .from('winner_proofs')
      .insert({ payout_id: payoutId, user_id: req.user.id, proof_url: proofUrl, status: 'pending' })
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ proof: data });
  } catch (err) {
    return next(err);
  }
};
