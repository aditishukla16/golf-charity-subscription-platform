export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'subscriber' | 'admin';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  subscription_plan: 'monthly' | 'yearly' | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website: string | null;
  category: string;
  is_featured: boolean;
  total_received: number;
  created_at: string;
}

export interface UserCharitySelection {
  id: string;
  user_id: string;
  charity_id: string;
  percentage: number;
  created_at: string;
  updated_at: string;
  charity?: Charity;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  date_played: string;
  created_at: string;
}

export interface Draw {
  id: string;
  draw_date: string;
  draw_month: string;
  total_prize_pool: number;
  is_published: boolean;
  winning_numbers: number[];
  jackpot_rollover: number;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: '5-match' | '4-match' | '3-match';
  prize_amount: number;
  user_numbers: number[];
  verification_status: 'pending' | 'approved' | 'rejected';
  proof_screenshot_url: string | null;
  payment_status: 'pending' | 'completed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  draw?: Draw;
  profile?: Profile;
}
