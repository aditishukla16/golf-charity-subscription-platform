import { supabase } from '../config/supabase.js';
import { currentDrawMonth, pickWinner } from '../utils/drawEngine.js';
import { env } from '../config/env.js';

const createPayoutForWinner = async ({ drawResultId, winnerUserId, amount }) => supabase
  .from('payouts')
  .insert({
    draw_result_id: drawResultId,
    user_id: winnerUserId,
    amount,
    status: 'pending'
  });

export const runDraw = async (req, res, next) => {
  try {
    const { mode = 'random', drawMonth = currentDrawMonth() } = req.body;
    if (!['random', 'weighted'].includes(mode)) {
      return res.status(400).json({ message: 'mode must be random or weighted.' });
    }

    const { data: existing } = await supabase
      .from('draw_results')
      .select('id')
      .eq('draw_month', drawMonth)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: `Draw already exists for month ${drawMonth}.` });
    }

    const { data: eligible, error: eligibleError } = await supabase
      .from('scores')
      .select('user_id, score')
      .gte('date_played', `${drawMonth}-01`)
      .lte('date_played', `${drawMonth}-31`);

    if (eligibleError) throw eligibleError;
    if (!eligible?.length) return res.status(400).json({ message: 'No eligible scores for draw month.' });

    const winner = pickWinner({ scores: eligible, mode });

    const { data: lastDraw } = await supabase
      .from('draw_results')
      .select('jackpot_rollover')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const jackpotBase = env.defaultJackpotSeed + Number(lastDraw?.jackpot_rollover || 0);
    const jackpotRollover = Math.round(jackpotBase * 0.1 * 100) / 100;
    const winningAmount = Math.round((jackpotBase - jackpotRollover) * 100) / 100;

    const { data: createdDraw, error: drawError } = await supabase
      .from('draw_results')
      .insert({
        draw_month: drawMonth,
        mode,
        winner_user_id: winner.user_id,
        jackpot_amount: jackpotBase,
        jackpot_rollover: jackpotRollover,
        is_published: false,
        executed_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (drawError) throw drawError;

    await createPayoutForWinner({ drawResultId: createdDraw.id, winnerUserId: winner.user_id, amount: winningAmount });

    return res.status(201).json({ draw: createdDraw, payoutAmount: winningAmount });
  } catch (err) {
    return next(err);
  }
};

export const publishDrawResult = async (req, res, next) => {
  try {
    const { drawResultId } = req.params;
    const { data, error } = await supabase
      .from('draw_results')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', drawResultId)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ draw: data });
  } catch (err) {
    return next(err);
  }
};

export const listPublishedDraws = async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('draw_results')
      .select('*')
      .eq('is_published', true)
      .order('draw_month', { ascending: false });

    if (error) throw error;
    return res.json({ results: data || [] });
  } catch (err) {
    return next(err);
  }
};
