# Golf Charity Subscription Platform

A comprehensive SaaS platform that combines golf score tracking, charity contributions, and prize draws into an engaging community experience.

## Features

### Public Features
- Landing page with platform overview and featured charities
- Complete charity listing with search and category filters
- Pricing page with monthly and yearly subscription options
- Responsive design optimized for all devices

### User Features
- Secure authentication with Supabase
- Score entry system (Stableford format)
- Automatic management of last 5 scores
- Charity selection with adjustable contribution percentage (10-100%)
- Monthly draw participation
- Winnings tracking and verification
- Screenshot upload for winner verification

### Admin Features
- Comprehensive analytics dashboard
- User management and subscription control
- Charity management (add, edit, feature charities)
- Draw engine with simulation mode
- Winner verification workflow
- Payment status tracking
- Real-time statistics

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for authentication and database
- Lucide React for icons

## Database Schema

The platform uses the following main tables:
- profiles: User profiles with subscription status
- charities: Charity organizations
- user_charity_selections: User charity preferences
- scores: Golf scores (last 5 per user)
- draws: Monthly draw results
- winners: Winner records with verification

## Getting Started

### Prerequisites
- Node.js 18 or later
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   The `.env` file already contains your Supabase credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Default Access

After signup, users are created with:
- Role: subscriber
- Subscription Status: inactive

To test admin features, manually update a user's role to 'admin' in the database.

## Stripe Integration

The platform includes subscription handling with placeholders for Stripe integration. To enable payments:

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Implement Stripe checkout in the pricing page
4. Add webhook handlers for subscription events
5. Update subscription status based on Stripe webhooks

For detailed Stripe setup instructions, visit: https://bolt.new/setup/stripe

## Draw System

The draw engine supports:
- Monthly automatic draws
- Random number generation (5 numbers)
- Match-based prizes (5-match, 4-match, 3-match)
- Simulation mode for testing
- Manual publish after review

## Deployment

The application is ready for deployment on:
- Vercel (recommended)
- Netlify
- Any static hosting service

Ensure environment variables are configured in your deployment platform.

## User Roles

- Subscriber: Can submit scores, select charities, view winnings
- Admin: Full platform management access

## Support

For issues or questions, please contact your platform administrator.
