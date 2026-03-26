import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const issueTokens = (user) => ({
  accessToken: signAccessToken({ id: user.id, role: user.role, email: user.email }),
  refreshToken: signRefreshToken({ id: user.id, role: user.role })
});

export const signup = async (req, res, next) => {
  try {
    const { email, password, fullName, charityId, charityContributionPct } = req.body;

    if (!email || !password || !charityId) {
      return res.status(400).json({ message: 'email, password, and charityId are required.' });
    }

    if (Number(charityContributionPct) < 10) {
      return res.status(400).json({ message: 'Minimum charity contribution is 10%.' });
    }

    const { data: charity } = await supabase
      .from('charities')
      .select('id')
      .eq('id', charityId)
      .maybeSingle();

    if (!charity) {
      return res.status(400).json({ message: 'Invalid charity selection.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: createdUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        full_name: fullName || null,
        password_hash: hashedPassword,
        role: 'user',
        selected_charity_id: charityId,
        charity_contribution_pct: Number(charityContributionPct)
      })
      .select('id, email, full_name, role, selected_charity_id, charity_contribution_pct')
      .single();

    if (userError) {
      if (String(userError.message).toLowerCase().includes('duplicate')) {
        return res.status(409).json({ message: 'Email is already registered.' });
      }
      throw userError;
    }

    const tokens = issueTokens(createdUser);
    return res.status(201).json({ user: createdUser, ...tokens });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, password_hash, selected_charity_id, charity_contribution_pct')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) throw error;

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const tokens = issueTokens(user);
    const { password_hash: _passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser, ...tokens });
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required.' });

    const payload = verifyRefreshToken(refreshToken);
    const { data: user } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', payload.id)
      .maybeSingle();

    if (!user) return res.status(401).json({ message: 'User not found for token.' });

    return res.json({ accessToken: signAccessToken(user) });
  } catch (err) {
    return next(err);
  }
};
