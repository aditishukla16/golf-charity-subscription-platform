import { supabase } from '../config/supabase.js';

export const listMyScores = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date_played', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return res.json({ scores: data || [] });
  } catch (err) {
    return next(err);
  }
};

export const createScore = async (req, res, next) => {
  try {
    const { score, datePlayed } = req.body;
    if (!Number.isInteger(score) || score < 0 || score > 72) {
      return res.status(400).json({ message: 'Score must be an integer between 0 and 72.' });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('scores')
      .insert({ user_id: req.user.id, score, date_played: datePlayed || new Date().toISOString().slice(0, 10) })
      .select('*')
      .single();

    if (insertError) throw insertError;

    const { data: allScores, error: listError } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', req.user.id)
      .order('date_played', { ascending: false })
      .order('created_at', { ascending: false });

    if (listError) throw listError;

    if (allScores.length > 5) {
      const staleScoreIds = allScores.slice(5).map((entry) => entry.id);
      await supabase.from('scores').delete().in('id', staleScoreIds);
    }

    return res.status(201).json({ score: inserted, message: 'Score added. Last 5 scores preserved.' });
  } catch (err) {
    return next(err);
  }
};
