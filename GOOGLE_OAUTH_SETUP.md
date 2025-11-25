# Google OAuth Setup Guide

Follow these steps to set up Google OAuth authentication for the 1MM Challenge app.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "1MM Challenge")
5. Click "Create"

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required information:
   - **App name**: "1MM Challenge" (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **Save and Continue**
6. On the **Scopes** page:
   - Click **Add or Remove Scopes**
   - Add these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **Update**, then **Save and Continue**
7. On the **Test users** page (for development):
   - Click **Add Users**
   - Add your Google account email (and any test accounts)
   - Click **Save and Continue**
8. Review and click **Back to Dashboard**

**Note**: You don't need to enable any specific APIs in the API Library. The OAuth consent screen configuration is sufficient.

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "1MM Challenge Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Add your production URL when deploying
   - Authorized redirect URIs:
     - `http://localhost:5173/login/google/callback` (for development)
     - Add your production callback URL when deploying (e.g., `https://yourdomain.com/login/google/callback`)
   - Click **Create**

5. **Copy the Client ID and Client Secret** - you'll need these next!

## Step 4: Configure Environment Variables

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   touch .env
   ```

2. Add your Google OAuth credentials to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

3. For production, also add:
   ```env
   PUBLIC_APP_URL=https://yourdomain.com
   ```

## Step 5: Restart Your Dev Server

After adding the environment variables, restart your development server:
```bash
npm run dev
```

## Step 6: Test Google OAuth

1. Go to `http://localhost:5173/login`
2. Click the "Continue with Google" button
3. You should be redirected to Google's login page
4. After logging in, you'll be redirected back to the app

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:5173/login/google/callback`
- Check for trailing slashes or typos

### "Invalid Client" Error
- Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure there are no extra spaces in the `.env` file

### Environment Variables Not Loading
- Make sure `.env` is in the project root (same directory as `package.json`)
- Restart your dev server after adding/changing `.env` variables
- Check that `.env` is not in `.gitignore` (it should be, but the file should exist locally)

## Production Setup

When deploying to production:

1. Update the OAuth consent screen to publish your app (if needed)
2. Add your production redirect URI in Google Cloud Console
3. Set `PUBLIC_APP_URL` environment variable to your production URL
4. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your production environment

