# 🚀 Production Deployment Guide

This guide covers everything you need to know to deploy Annadaan to production safely and securely.

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Generate a strong JWT_SECRET (at least 32 characters)
  ```bash
  openssl rand -base64 64
  ```
- [ ] Set secure database credentials
- [ ] Configure SMTP with app-specific passwords
- [ ] Set `NODE_ENV=production`
- [ ] Set `NEXT_PUBLIC_BASE_URL` to your domain
- [ ] Review and adjust rate limiting settings

### 2. Security Hardening

- [ ] **JWT_SECRET**: NEVER use default value
- [ ] **Database**: Create dedicated user with minimal permissions
- [ ] **SMTP**: Use app-specific passwords, not account passwords
- [ ] **Firewall**: Configure firewall rules
- [ ] **SSL/TLS**: Install valid certificates
- [ ] **File Permissions**: Set restrictive permissions on `.env` file
  ```bash
  chmod 600 .env
  ```

### 3. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE foodrescue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create dedicated user
CREATE USER 'annadaan_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON foodrescue.* TO 'annadaan_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Application Setup

```bash
# Install dependencies
npm install --production

# Build application
npm run build

# Run database initialization (first time only)
# This will create all required tables
curl -X POST http://localhost:3000/api/setup
```

## 🔒 Security Best Practices

### Environment Variables

**Critical**: Never commit `.env` file to version control!

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### JWT Secret Generation

Generate a cryptographically secure secret:

```bash
# Option 1: OpenSSL (recommended)
openssl rand -base64 64

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Option 3: Online (use trusted source only)
# https://www.grc.com/passwords.htm
```

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings → Security
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use app password in `SMTP_PASS` (not your regular password)

### Database Security

```sql
-- Create user with minimal permissions
CREATE USER 'annadaan_user'@'localhost' IDENTIFIED BY 'strong_password';

-- Grant only necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON foodrescue.* TO 'annadaan_user'@'localhost';

-- Do NOT grant DROP, CREATE, ALTER in production
FLUSH PRIVILEGES;
```

## 🚀 Deployment Options

### Option 1: VPS/Dedicated Server (Recommended)

#### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "annadaan" -- start

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup

# Monitor application
pm2 monit

# View logs
pm2 logs annadaan
```

#### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

⚠️ **Note**: Vercel has serverless function limitations. Ensure your database supports remote connections.

### Option 3: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - mysql
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

```bash
# Deploy with Docker Compose
docker-compose up -d
```

## 📊 Monitoring & Logging

### Health Check Endpoint

```bash
# Check application health
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": {
    "healthy": true,
    "timestamp": "2024-01-20T10:30:00.000Z"
  }
}
```

### Log Management

Application logs are structured JSON for easy parsing:

```bash
# View logs with PM2
pm2 logs annadaan

# Filter errors only
pm2 logs annadaan --err

# Stream logs
pm2 logs annadaan --lines 100 --nostream
```

### Monitoring Services (Recommended)

- **Sentry**: Error tracking and performance monitoring
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring
- **Logtail**: Log aggregation and analysis

## 🔄 Backup Strategy

### Database Backups

```bash
# Daily automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
mkdir -p $BACKUP_DIR

mysqldump -u annadaan_user -p$DB_PASSWORD foodrescue | gzip > $BACKUP_DIR/foodrescue_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

```bash
# Add to crontab for daily execution at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### File Backups

If storing uploaded files locally (not recommended for production):

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /path/to/uploads
```

**Recommendation**: Use cloud storage (S3, Azure Blob) for uploaded files.

## 🔧 Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart annadaan

# Or restart with systemd
systemctl restart annadaan
```

### Database Migrations

```bash
# Run migrations
npm run migrate

# Or manually via API (development only)
curl -X POST http://localhost:3000/api/migrate
```

## 🐛 Troubleshooting

### Connection Issues

```bash
# Check if application is running
pm2 status

# Check logs for errors
pm2 logs annadaan --err

# Test database connection
mysql -u annadaan_user -p -h localhost foodrescue
```

### Performance Issues

```bash
# Check system resources
top
htop

# Check MySQL performance
mysql -u root -p
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';

# Restart services if needed
pm2 restart annadaan
systemctl restart mysql
```

### Email Not Sending

1. Verify SMTP credentials
2. Check Gmail app password is correct
3. Ensure 2FA is enabled on Gmail
4. Check firewall allows outbound port 587
5. Review logs for SMTP errors

```bash
# Test SMTP connection
telnet smtp.gmail.com 587
```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_listings_status ON food_listings(status);
CREATE INDEX idx_donations_status ON upi_donations(status);

-- Analyze query performance
EXPLAIN SELECT * FROM users WHERE email = 'example@test.com';
```

### Connection Pool Tuning

Adjust `DB_CONNECTION_LIMIT` based on your server resources:

```env
# For small VPS (1-2 CPU cores, 2GB RAM)
DB_CONNECTION_LIMIT=20

# For medium server (4 CPU cores, 8GB RAM)
DB_CONNECTION_LIMIT=50

# For large server (8+ CPU cores, 16GB+ RAM)
DB_CONNECTION_LIMIT=100
```

### Caching Strategy

Consider implementing:
- Redis for session storage
- CDN for static assets
- Query result caching for frequently accessed data

## 🔐 SSL/TLS Certificate Setup

### Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

## 📱 System Requirements

### Minimum

- CPU: 2 cores
- RAM: 2GB
- Disk: 20GB SSD
- OS: Ubuntu 20.04+ or similar

### Recommended

- CPU: 4 cores
- RAM: 8GB
- Disk: 50GB SSD
- OS: Ubuntu 22.04 LTS

### Database

- MySQL 8.0+ or MariaDB 10.5+
- InnoDB storage engine
- UTF8MB4 character set

## 🆘 Support

For issues or questions:

1. Check logs: `pm2 logs annadaan`
2. Review health endpoint: `/api/health`
3. Check database connectivity
4. Verify environment variables
5. Review this guide's troubleshooting section

## 📝 Additional Resources

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
