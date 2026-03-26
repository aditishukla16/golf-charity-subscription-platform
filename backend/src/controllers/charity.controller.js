import { supabase } from '../config/supabase.js';

export const listCharities = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let query = supabase.from('charities').select('*').order('is_featured', { ascending: false }).order('name');

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ charities: data || [] });
  } catch (err) {
    return next(err);
  }
};

export const updateMyCharitySelection = async (req, res, next) => {
  try {
    const { charityId, contributionPct } = req.body;
    if (!charityId || Number(contributionPct) < 10) {
      return res.status(400).json({ message: 'Valid charityId and contributionPct >= 10 are required.' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ selected_charity_id: charityId, charity_contribution_pct: Number(contributionPct) })
      .eq('id', req.user.id)
      .select('id, selected_charity_id, charity_contribution_pct')
      .single();

    if (error) throw error;
    return res.json({ selection: data });
  } catch (err) {
    return next(err);
  }
};
