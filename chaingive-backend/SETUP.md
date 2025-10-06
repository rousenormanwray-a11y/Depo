# 🛠️ ChainGive Backend Setup Guide

Complete step-by-step guide to set up the ChainGive backend from scratch.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ LTS ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** 10+ (comes with Node.js)
- **Git** (for cloning the repository)

Optional:
- **Redis** 7+ (for production caching)
- **Docker** (for containerized deployment)

---

## Step 1: Install Dependencies

```bash
cd chaingive-backend
npm install
```

This will install all required packages:
- Express.js
- Prisma ORM
- JWT libraries
- Joi validation
- Winston logger
- And more...

---

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)
```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

2. **Create database and user**
```bash
# Login to PostgreSQL
sudo -u postgres psql

# In psql console:
CREATE DATABASE chaingive_db;
CREATE USER chaingive WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chaingive_db TO chaingive;
\q
```

3. **Update DATABASE_URL in .env**
```env
DATABASE_URL="postgresql://chaingive:your_password@localhost:5432/chaingive_db?schema=public"
```

### Option B: Cloud PostgreSQL (Supabase, Neon, Railway)

1. **Create a free PostgreSQL database** on:
   - [Supabase](https://supabase.com) - Free tier available
   - [Neon](https://neon.tech) - Serverless PostgreSQL
   - [Railway](https://railway.app) - Easy deployment

2. **Copy connection string** and add to `.env`
```env
DATABASE_URL="postgresql://user:password@host.region.provider.com:5432/database"
```

---

## Step 3: Configure Environment Variables

1. **Copy the example file:**
```bash
cp .env.example .env
```

2. **Edit .env with your values:**

### Required Variables

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database (from Step 2)
DATABASE_URL="postgresql://chaingive:password@localhost:5432/chaingive_db?schema=public"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars_long
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# CORS
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:3000
```

### Optional Variables (can configure later)

```env
# Redis (for production)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Payment Providers (get from providers)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+234XXXXXXXXX

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@chaingive.ng
SMTP_PASSWORD=xxxxx
```

**Security Note:** Generate strong random secrets for JWT:
```bash
# On macOS/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator (development only):
# https://randomkeygen.com/
```

---

## Step 4: Set Up Database Schema

1. **Generate Prisma Client:**
```bash
npm run prisma:generate
```

2. **Run database migrations:**
```bash
npm run prisma:migrate
```

This will create all tables:
- users
- wallets
- transactions
- escrows
- cycles
- matches
- kyc_records
- agents
- marketplace_listings
- redemptions
- blockchain_logs

3. **Verify database:**
```bash
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555` where you can view and edit data.

---

## Step 5: Seed Database (Optional)

Create sample data for testing:

1. **Create seed script:**
```bash
# Create prisma/seed.ts
```

2. **Run seed:**
```bash
npx prisma db seed
```

---

## Step 6: Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 ChainGive API Server running on port 3000
📝 Environment: development
🔗 API Version: v1
🌍 Health check: http://localhost:3000/health
```

---

## Step 7: Test the API

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-06T12:00:00.000Z",
  "uptime": 0.123,
  "environment": "development"
}
```

### Test Registration

```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registration successful. Please verify your phone number.",
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "+2348012345678",
      ...
    },
    "requiresOTP": true
  }
}
```

**Important:** Check your terminal logs for the OTP (in development, OTPs are logged to console).

---

## Step 8: Configure Third-Party Services (Optional)

### Twilio (SMS OTP)

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID, Auth Token, and Phone Number
3. Add to `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+234XXXXXXXXX
```

4. Uncomment Twilio code in `src/services/otp.service.ts`

### Flutterwave (Payments)

1. Sign up at [Flutterwave](https://www.flutterwave.com/)
2. Get test API keys from dashboard
3. Add to `.env`:
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
```

### Firebase (Push Notifications)

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Download service account JSON
3. Add credentials to `.env`

---

## Step 9: Production Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

### Start Production Server

```bash
NODE_ENV=production npm start
```

### Deploy to Cloud

#### Option A: Railway.app (Easiest)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables in Railway dashboard

#### Option B: Heroku

1. Install Heroku CLI
2. Create app:
```bash
heroku create chaingive-api
heroku addons:create heroku-postgresql:mini
```

3. Deploy:
```bash
git push heroku main
```

#### Option C: AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. SSH into instance
3. Install Node.js and PostgreSQL
4. Clone repository
5. Set up environment
6. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start dist/server.js --name chaingive-api
pm2 save
pm2 startup
```

---

## Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001
```

Or kill process on port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error

1. Check PostgreSQL is running:
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app
```

2. Verify DATABASE_URL format:
```
postgresql://user:password@host:port/database?schema=public
```

3. Test connection:
```bash
npx prisma db pull
```

### Prisma Migration Errors

Reset database (⚠️ **DELETES ALL DATA**):
```bash
npx prisma migrate reset
```

### Module Not Found Errors

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Rebuild:
```bash
npm run build
```

---

## Next Steps

✅ **Backend running?** Great! Now:

1. **Explore API endpoints** in `src/routes/`
2. **Test with Postman** (collection coming soon)
3. **Connect mobile app** (update API URL in mobile app)
4. **Add test data** using Prisma Studio
5. **Configure payment providers** for real transactions

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server with auto-reload
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm test                 # Run tests (when added)
```

---

## 📞 Need Help?

- **Documentation:** Check `README.md`
- **API Reference:** See Technical Architecture Document
- **Issues:** GitHub Issues (coming soon)
- **Email:** dev@chaingive.ng

---

**Happy Coding! 🚀**
