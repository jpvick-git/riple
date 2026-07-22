# Deploy Riple to a DigitalOcean droplet (riple.me)

This guide assumes an Ubuntu droplet and the domain **riple.me**.

## 1. Point DNS at your droplet

In your domain registrar (or DigitalOcean Networking â†’ Domains):

| Type | Name | Value              | TTL  |
|------|------|--------------------|------|
| A    | @    | YOUR_DROPLET_IP    | 300  |
| A    | www  | YOUR_DROPLET_IP    | 300  |

Wait until `riple.me` resolves to your droplet before requesting SSL.

```bash
dig +short riple.me
```

## 2. SSH into the droplet

```bash
ssh root@YOUR_DROPLET_IP
# or: ssh youruser@YOUR_DROPLET_IP
```

## 3. Install system packages

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx git
npm install -g pm2
```

## 4. Clone and configure the app

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/jpvick-git/riple.git riple
cd riple

# Production env (never commit this file)
nano .env.local
```

Paste:

```env
OPENAI_API_KEY=your_actual_key_here
OPENAI_MODEL=gpt-5-mini
OPENAI_FAST_MODEL=gpt-5-mini
OPENAI_DEEP_MODEL=gpt-5-mini
OPENAI_WEB_SEARCH=false
```

Then:

```bash
npm ci
npm run build
```

## 5. Run with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# run the command PM2 prints
```

Check: `curl -I http://127.0.0.1:3001`

## Same droplet as another app

Riple is configured for **port 3001** so it does not collide with another Next/Node app on 3000 (for example a car flipper site).

Nginx uses `server_name riple.me` â€” keep your other appâ€™s site config as a separate file with its own domain. Both can listen on ports 80/443; Nginx routes by hostname.

```text
riple.me  â†’ 127.0.0.1:3001  (this app)
other.app â†’ 127.0.0.1:3000  (existing app)
```

Do **not** remove your existing Nginx site when enabling Riple. Only add `riple.me` and reload Nginx.

## 6. Configure Nginx

```bash
cp deploy/nginx-riple.me.conf /etc/nginx/sites-available/riple.me
ln -sf /etc/nginx/sites-available/riple.me /etc/nginx/sites-enabled/riple.me
# Do NOT delete your other app's site from sites-enabled
nginx -t
systemctl reload nginx
```
## 7. Enable HTTPS

```bash
certbot --nginx -d riple.me -d www.riple.me
```

Certbot will adjust Nginx and renew automatically.

## 8. Open firewall (if ufw is on)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## Updating later

```bash
cd /var/www/riple
git pull
npm ci
npm run build
pm2 restart riple
```

## Daily usage email

Riple can email you yesterday’s usage (new ripples, API requests, cache hits, tokens, top IPs).

### 1. Resend

1. Create a free account at [resend.com](https://resend.com)
2. Create an API key
3. For testing, send to the same address you signed up with using `onboarding@resend.dev`
4. Later, verify `riple.me` in Resend and set `REPORT_FROM_EMAIL` to something like `Riple Reports <reports@riple.me>`

### 2. Env on the droplet

Add to `/var/www/riple/.env.local`:

```env
REPORT_EMAIL=you@example.com
REPORT_FROM_EMAIL=Riple Reports <onboarding@resend.dev>
REPORT_TZ=America/Chicago
RESEND_API_KEY=re_xxxxxxxx
CRON_SECRET=generate-a-long-random-string
```

Restart: `pm2 restart riple`

### 3. Cron (once a day)

Runs at 8:05 AM Chicago time (adjust as you like):

```bash
crontab -e
```

Add:

```cron
5 8 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://riple.me/api/cron/daily-report >> /var/log/riple-daily-report.log 2>&1
```

If the server clock is UTC, use `5 13 * * *` for ~8:05 AM CDT, or install `tzdata` and set `CRON_TZ=America/Chicago` above the line.

### 4. Test once

```bash
curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://riple.me/api/cron/daily-report
```

## Checklist

- [ ] DNS A records for `@` and `www`
- [ ] `.env.local` on the server with `OPENAI_API_KEY`
- [ ] `.env.local` includes `DATABASE_URL` for the `riple` Postgres database
- [ ] Database trusted sources include the droplet IP
- [ ] `npm run build` succeeds
- [ ] PM2 shows `riple` online
- [ ] `https://riple.me` loads
- [ ] Create Riple works (API key valid)
- [ ] Daily report env + crontab configured (optional)

