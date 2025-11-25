# 1 Million Meter Challenge

A SvelteKit web application for tracking progress towards a 1 million meter challenge across various sports.

## Features

### Authentication
- **Signup/Login**: Email and password authentication with secure password hashing (bcryptjs)
- **Google OAuth**: Sign in with Google account
- **Session Management**: Secure session-based authentication using Lucia

### Leaderboard
- **Public Leaderboard**: View all participants and their current year progress (no login required)
- **Current Year Focus**: Leaderboard shows progress for the current year only
- **Statistics Display**: 
  - Total meters for the year
  - Daily average
  - Estimated completion date
  - Progress percentage with visual progress bars
- **User Detail Pages**: Click on any user to view their detailed progress by year

### Progress Logging
- **Flexible Entry**: Log progress in meters or miles (automatic conversion)
- **Multiple Entries Per Day**: Log multiple workouts in a single day
- **Timestamps**: All entries include date and time (Eastern Time)
- **Edit & Delete**: Users can edit or delete their own entries
- **Recent Entries**: View your 50 most recent entries with full details

### User Profile
- **Update Display Name**: Change your display name anytime
- **Change Sport**: Update your sport (deletes all current year entries)
- **Sport Selection on First Entry**: Change your sport when logging your first entry of a new year
- **Account Deletion**: Permanently delete your account and all associated data

### Statistics & Tracking
- **Total Progress**: Track progress towards 1 million meters
- **Daily Average**: Calculated from your historical entries
- **Estimated Completion**: Projected completion date based on your pace
- **Year-by-Year View**: View progress filtered by year on user detail pages

### User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **USA Patriotic Theme**: Red, white, and blue color scheme
- **Accessible**: Proper form labels and keyboard navigation

## Tech Stack

- **SvelteKit** - Full-stack framework
- **Svelte 5** - Reactive UI framework with runes
- **TypeScript** - Type safety
- **SQLite** (better-sqlite3) - Database
- **Lucia Auth** - Secure authentication library
- **Arctic** - OAuth provider library (Google OAuth)
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Install dependencies:
```sh
npm install
```

2. (Optional) Set up Google OAuth:
   - See `GOOGLE_OAUTH_SETUP.md` for detailed instructions
   - Create a `.env` file with:
     ```
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     ```

3. Start the development server:
```sh
npm run dev

# or open in browser automatically
npm run dev -- --open
```

The app will be available at `http://localhost:5173`

### Database

The SQLite database (`dev.db` for development, `prod.db` for production) will be automatically created on first run. The schema includes:

- `users` table: Stores user information (id, name, email, sport, password_hash, google_id, created_at)
- `sessions` table: Stores active user sessions (managed by Lucia)
- `progress_entries` table: Stores progress entries (id, user_id, meters, entry_date, entry_time, entry_timestamp, created_at)

Database migrations run automatically on startup to handle schema updates.

## Usage

1. **Sign Up**: Visit `/signup` to create an account with your name, email, password, and sport
2. **Log In**: Visit `/login` to sign in, or use "Continue with Google" for OAuth
3. **View Leaderboard**: The home page (`/`) displays the current year leaderboard (no login required)
4. **Log Progress**: Visit `/progress` to log your daily meters or miles
5. **View User Details**: Click on any user in the leaderboard to see their detailed progress by year
6. **Manage Profile**: Click on your name in the navbar to access profile settings

## Building for Production

```sh
npm run build
npm run preview
```

The production build uses the `@sveltejs/adapter-node` adapter.

### Environment Variables

For production, set these environment variables:

- `GOOGLE_CLIENT_ID` - Google OAuth Client ID (optional, for Google sign-in)
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret (optional, for Google sign-in)
- `PUBLIC_APP_URL` - Your application's public URL (for OAuth redirects)

## Project Structure

```
src/
├── lib/
│   ├── db.ts              # Database setup, schema, and migrations
│   ├── auth.ts            # Authentication utilities (Lucia wrapper)
│   ├── lucia.ts           # Lucia authentication configuration
│   ├── auth-google.ts     # Google OAuth provider setup
│   ├── timezone.ts        # Eastern Time conversion utilities
│   ├── stores/
│   │   └── theme.ts       # Dark mode theme store
│   └── components/
│       └── Navbar.svelte  # Navigation bar component
└── routes/
    ├── +page.svelte       # Home page (leaderboard)
    ├── +layout.svelte     # Main layout with navbar
    ├── signup/            # Signup page
    ├── login/             # Login page
    │   └── google/        # Google OAuth callback
    ├── progress/          # Progress logging page
    ├── profile/           # User preferences page
    │   └── complete/      # Profile completion (for OAuth users)
    ├── user/[id]/         # User detail page (by year)
    └── api/               # API routes
        ├── signup/        # User registration
        ├── login/         # User login
        ├── logout/        # User logout
        ├── profile/       # Profile management (name, sport, delete)
        └── entries/[id]/  # Entry edit/delete
```

## Notes

- The database file is excluded from git (see `.gitignore`)
- Sessions are managed by Lucia with secure HTTP-only cookies
- In production, cookies are automatically set to secure (HTTPS only)
- All timestamps are stored in UTC and displayed in Eastern Time
- Leaderboard shows current year progress only
- Users can change their sport on the first entry of each new year
- Changing sport in profile settings deletes all entries for the current year

## License

Private project
