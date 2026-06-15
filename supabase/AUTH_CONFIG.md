# Supabase Auth Configuration

## Dashboard Settings

Navigate to **Authentication → Settings** in your Supabase project dashboard.

### Email Auth Provider

| Setting | Value | Reason |
|---------|-------|--------|
| **Enable Email provider** | ON | Use email/password login |
| **Confirm email** | **OFF** | Personal app, no need to verify |
| **Secure email change** | OFF | Not needed |
| **Secure password change** | OFF | Not needed |

### SMTP Settings

Leave as default (Supabase managed). Only needed if you want custom email sending.

### Auth Settings

| Setting | Value | Reason |
|---------|-------|--------|
| **Site URL** | `https://<username>.github.io/nutri-track` | For production |
| **Redirect URLs** | `http://localhost:5173/**` for dev | Allow local dev redirects |

### User Creation

Since this is a **personal app**, create the user account manually:

1. Go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter email and password
4. `require email confirmation` = **unchecked** (auto-confirm)

This creates the user immediately. The `handle_new_user()` trigger will auto-create the `profiles` row.

### JWT Settings

| Setting | Value |
|---------|-------|
| JWT expiry | 3600 (1 hour, default) |
| Refresh token rotation | Enabled (default) |

### Protecting the Anon Key

The `VITE_SUPABASE_ANON_KEY` is safe to expose in the frontend code because **RLS policies** ensure users can only access their own data. The `service_role` key must NEVER be exposed client-side — it's only used in Edge Functions.
