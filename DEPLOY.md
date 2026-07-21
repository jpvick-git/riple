# Deploy Ripple to a DigitalOcean droplet (riple.me)

This guide assumes an Ubuntu droplet and the domain **riple.me**.

## 1. Point DNS at your droplet

In your domain registrar (or DigitalOcean Networking → Domains):

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

Ripple is configured for **port 3001** so it does not collide with another Next/Node app on 3000 (for example a car flipper site).

Nginx uses `server_name riple.me` — keep your other app’s site config as a separate file with its own domain. Both can listen on ports 80/443; Nginx routes by hostname.

```text
riple.me  → 127.0.0.1:3001  (this app)
other.app → 127.0.0.1:3000  (existing app)
```

Do **not** remove your existing Nginx site when enabling Ripple. Only add `riple.me` and reload Nginx.

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

## Checklist

- [ ] DNS A records for `@` and `www`
- [ ] `.env.local` on the server with `OPENAI_API_KEY`
- [ ] `npm run build` succeeds
- [ ] PM2 shows `riple` online
- [ ] `https://riple.me` loads
- [ ] Create Ripple works (API key valid)
