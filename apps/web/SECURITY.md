# Security Policy

## Environment Variables Protection

### Critical Rules

1. **NEVER commit `.env.local` or any `.env` files to git**
   - These files are already in `.gitignore`
   - They contain sensitive API keys and secrets

2. **AI Agent Protection**
   - AI agents (including Claude Code) are instructed NOT to read `.env.local`
   - Use `.env.example` or `.env.local.template` for documentation only
   - Never paste actual API keys in conversations with AI agents

3. **Safe Practices**
   - Always use `.env.local` for local development secrets
   - Use `.env.example` or `.env.local.template` for templates (no real values)
   - Use environment variables in production (Vercel, Cloudflare, etc.)

### Before First Commit

Run these commands to ensure no secrets are tracked:

```bash
# Initialize git (if not already done)
git init

# Verify .env.local is not tracked
git status | grep -i env

# If you accidentally staged .env.local, remove it:
git rm --cached .env.local

# Check git history for any leaked secrets
git log --all --full-history -- "*.env*"
```

### If Secrets Are Leaked

If you accidentally commit secrets to git:

1. **Immediately rotate all API keys**:
   - Gemini API: https://makersuite.google.com/app/apikey
   - Cloudflare: https://dash.cloudflare.com/profile/api-tokens
   - Any other services

2. **Remove from git history**:
   ```bash
   # Use git filter-branch or BFG Repo-Cleaner
   # See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
   ```

3. **Force push to remote** (if already pushed):
   ```bash
   git push --force
   ```

### Protected Files

The following files are protected by `.gitignore`:
- `.env`
- `.env.local`
- `.env*.local`
- `*.pem`
- Any file matching `**/credentials.json`
- Any file matching `**/secrets.json`

### Reporting Security Issues

If you discover a security vulnerability, please email [security contact] instead of opening a public issue.
