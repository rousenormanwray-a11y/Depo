# 🗄️ Database Setup & Migration Guide

**Date:** October 6, 2025  
**Purpose:** Create crypto payment tables and run migrations

---

## 📋 **PREREQUISITES**

✅ Node.js installed (v16+)  
✅ PostgreSQL installed and running  
✅ Git repository cloned locally  
✅ `.env` file configured  

---

## 🚀 **STEP-BY-STEP GUIDE**

### **Step 1: Clone Your Repository**

```bash
# Clone from GitHub
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Navigate to backend
cd chaingive-backend
```

---

### **Step 2: Install Dependencies**

```bash
# Install all packages
npm install

# This will install:
# - prisma
# - @prisma/client
# - All other dependencies
```

---

### **Step 3: Configure Database Connection**

Create/update `.env` file in `chaingive-backend/`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chaingive_db?schema=public"

# Example for local PostgreSQL:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/chaingive_db?schema=public"

# Example for remote PostgreSQL (Render, Railway, etc.):
DATABASE_URL="postgresql://user:pass@host.railway.app:5432/dbname"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Node Environment
NODE_ENV="development"
PORT=3000
```

---

### **Step 4: Create Database (if not exists)**

**Option A: Using psql (PostgreSQL CLI)**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE chaingive_db;

# Exit
\q
```

**Option B: Using pgAdmin**
- Open pgAdmin
- Right-click on "Databases"
- Select "Create" → "Database"
- Name: `chaingive_db`
- Click "Save"

**Option C: Let Prisma create it**
```bash
# Prisma will create the database if it doesn't exist
npx prisma db push
```

---

### **Step 5: Generate Prisma Client**

```bash
# Generate TypeScript types from schema
npx prisma generate

# Output:
# ✔ Generated Prisma Client
```

---

### **Step 6: Run Database Migrations**

**Option A: Development Migration (Recommended)**
```bash
# Create and run migration
npx prisma migrate dev --name add_crypto_payments

# What this does:
# 1. Creates migration files in prisma/migrations/
# 2. Applies migration to database
# 3. Creates all 4 crypto payment tables
# 4. Generates Prisma Client

# Output:
# Applying migration `20251006_add_crypto_payments`
# ✔ The following migration(s) have been created and applied:
# migrations/
#   └─ 20251006_add_crypto_payments/
#      └─ migration.sql
```

**Option B: Production Deployment**
```bash
# For production (CI/CD or deployment):
npx prisma migrate deploy

# This applies pending migrations without prompts
```

**Option C: Direct Push (No Migration Files)**
```bash
# Push schema directly to database
# (Not recommended for production)
npx prisma db push

# Output:
# ✔ The database is now in sync with your Prisma schema.
```

---

### **Step 7: Verify Tables Created**

**Check with Prisma Studio (GUI):**
```bash
npx prisma studio

# Opens browser at: http://localhost:5555
# You can view all tables and data
```

**Check with psql:**
```bash
psql -U postgres -d chaingive_db

# List all tables
\dt

# Should show:
# - crypto_payment_configs
# - crypto_coins
# - crypto_payments
# - crypto_payment_logs

# Describe a table
\d crypto_payments

# Exit
\q
```

---

## 📊 **TABLES CREATED**

After migration, you'll have these 4 new tables:

### **1. crypto_payment_configs**
```sql
id                  UUID PRIMARY KEY
btcpay_server_url   TEXT
btcpay_api_key      TEXT (encrypted)
btcpay_store_id     TEXT
is_enabled          BOOLEAN
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### **2. crypto_coins**
```sql
id                      UUID PRIMARY KEY
symbol                  TEXT
name                    TEXT
network                 TEXT
wallet_address          TEXT
min_amount              DECIMAL(12,2)
max_amount              DECIMAL(12,2)
confirmations_required  INTEGER
icon                    TEXT
color                   TEXT
is_enabled              BOOLEAN
created_at              TIMESTAMP
updated_at              TIMESTAMP

UNIQUE (symbol, network)
INDEX (is_enabled)
```

### **3. crypto_payments**
```sql
id                  UUID PRIMARY KEY
agent_id            TEXT
agent_name          TEXT
crypto_coin_id      UUID (FK → crypto_coins)
coin_symbol         TEXT
coin_amount         INTEGER
ngn_amount          DECIMAL(12,2)
crypto_amount       TEXT
wallet_address      TEXT
transaction_hash    TEXT
btcpay_invoice_id   TEXT
confirmations       INTEGER
status              TEXT
admin_notes         TEXT
rejection_reason    TEXT
confirmed_by        TEXT
confirmed_at        TIMESTAMP
rejected_by         TEXT
rejected_at         TIMESTAMP
expires_at          TIMESTAMP
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX (agent_id)
INDEX (status)
INDEX (created_at)
INDEX (expires_at)
```

### **4. crypto_payment_logs**
```sql
id            UUID PRIMARY KEY
payment_id    UUID (FK → crypto_payments)
action        TEXT
performed_by  TEXT
details       TEXT (JSON)
ip_address    TEXT
created_at    TIMESTAMP

INDEX (payment_id)
INDEX (created_at)
```

---

## 🌱 **SEED INITIAL DATA (Optional)**

Create `prisma/seed.ts` to add initial crypto coins:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding crypto coins...');

  // Add Bitcoin
  const btc = await prisma.cryptoCoin.upsert({
    where: { 
      symbol_network: { 
        symbol: 'BTC', 
        network: 'Bitcoin Mainnet' 
      } 
    },
    update: {},
    create: {
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'Bitcoin Mainnet',
      walletAddress: 'YOUR_BTC_WALLET_ADDRESS',
      minAmount: 1000,
      maxAmount: 10000000,
      confirmationsRequired: 3,
      icon: 'currency-btc',
      color: '#F7931A',
      isEnabled: true,
    },
  });

  // Add Ethereum
  const eth = await prisma.cryptoCoin.upsert({
    where: { 
      symbol_network: { 
        symbol: 'ETH', 
        network: 'Ethereum Mainnet' 
      } 
    },
    update: {},
    create: {
      symbol: 'ETH',
      name: 'Ethereum',
      network: 'Ethereum Mainnet',
      walletAddress: 'YOUR_ETH_WALLET_ADDRESS',
      minAmount: 1000,
      maxAmount: 10000000,
      confirmationsRequired: 12,
      icon: 'currency-eth',
      color: '#627EEA',
      isEnabled: true,
    },
  });

  // Add USDT
  const usdt = await prisma.cryptoCoin.upsert({
    where: { 
      symbol_network: { 
        symbol: 'USDT', 
        network: 'ERC-20' 
      } 
    },
    update: {},
    create: {
      symbol: 'USDT',
      name: 'Tether USD',
      network: 'ERC-20',
      walletAddress: 'YOUR_USDT_WALLET_ADDRESS',
      minAmount: 100,
      maxAmount: 5000000,
      confirmationsRequired: 12,
      icon: 'cash',
      color: '#26A17B',
      isEnabled: true,
    },
  });

  console.log('✅ Seeded:', { btc, eth, usdt });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Add to `package.json`:**
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Run seed:**
```bash
npx prisma db seed
```

---

## 🔍 **VERIFY EVERYTHING WORKS**

### **1. Start Backend Server**
```bash
# In chaingive-backend/
npm run dev

# Should output:
# Server running on port 3000
# Database connected
```

### **2. Test Endpoints**

**Get Crypto Coins (should be empty initially):**
```bash
curl http://localhost:3000/v1/admin/crypto-payment/coins \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Health Check:**
```bash
curl http://localhost:3000/health

# Response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-06T...",
#   "uptime": 123.45
# }
```

---

## 🐛 **TROUBLESHOOTING**

### **Error: `DATABASE_URL` not found**
```bash
# Make sure .env exists in chaingive-backend/
ls -la .env

# If not, create it:
touch .env
# Then add DATABASE_URL
```

### **Error: Database does not exist**
```bash
# Create database manually:
psql -U postgres -c "CREATE DATABASE chaingive_db;"
```

### **Error: Connection refused**
```bash
# Check if PostgreSQL is running:
sudo service postgresql status

# Start PostgreSQL:
sudo service postgresql start
```

### **Error: Migration already exists**
```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev
```

### **Error: Schema drift detected**
```bash
# Your database is out of sync with schema.prisma

# Option 1: Create new migration
npx prisma migrate dev

# Option 2: Force push schema
npx prisma db push --accept-data-loss
```

---

## 📁 **MIGRATION FILES**

After running `prisma migrate dev`, you'll see:

```
chaingive-backend/
└── prisma/
    ├── schema.prisma
    └── migrations/
        └── 20251006123456_add_crypto_payments/
            └── migration.sql
```

**migration.sql** contains:
```sql
-- CreateTable
CREATE TABLE "crypto_payment_configs" (
    "id" TEXT NOT NULL,
    "btcpay_server_url" TEXT NOT NULL,
    "btcpay_api_key" TEXT NOT NULL,
    "btcpay_store_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "crypto_payment_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_coins" (
    ...
);

-- ... more tables
```

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **On Render/Railway/Heroku:**

**1. Add Environment Variable:**
```
DATABASE_URL=your-production-database-url
```

**2. Add Build Command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**3. Start Command:**
```bash
npm start
```

---

## ✅ **SUCCESS CHECKLIST**

After completing all steps, verify:

- [x] PostgreSQL is running
- [x] Database `chaingive_db` exists
- [x] `.env` has correct `DATABASE_URL`
- [x] `npm install` completed successfully
- [x] `npx prisma generate` ran successfully
- [x] `npx prisma migrate dev` created 4 tables
- [x] `npx prisma studio` shows all tables
- [x] Backend server starts without errors
- [x] API endpoints respond correctly

---

## 📚 **USEFUL COMMANDS**

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (deletes all data)
npx prisma migrate reset

# Push schema without migration files
npx prisma db push

# Open Prisma Studio (GUI)
npx prisma studio

# View migration status
npx prisma migrate status

# Format schema file
npx prisma format

# Pull schema from database
npx prisma db pull
```

---

## 🎯 **WHAT'S NEXT**

After migrations are complete:

1. ✅ **Test Admin Endpoints** - Add crypto coins via API
2. ✅ **Test Agent Endpoints** - Initiate crypto purchase
3. ✅ **Setup BTCPay Server** - Configure real payment gateway
4. ✅ **Add Wallet Addresses** - For each crypto coin
5. ✅ **Test Full Flow** - From purchase to confirmation

---

## 🎊 **COMPLETION**

Once migrations are done, your database will have:
- ✅ 4 new tables for crypto payments
- ✅ All indexes and constraints
- ✅ Full audit trail system
- ✅ Ready for production use

**Your crypto payment system is LIVE!** 🚀

---

**Need help?** Check the error messages above or run:
```bash
npx prisma migrate status
npx prisma studio
```
