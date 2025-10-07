# 🏗️ **ChainGive Technical Architecture Document**

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Document Owner:** Engineering Team

---

## 📖 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [API Documentation](#5-api-documentation)
6. [Blockchain Integration](#6-blockchain-integration)
7. [Security Architecture](#7-security-architecture)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [Performance Specifications](#10-performance-specifications)
11. [Monitoring & Logging](#11-monitoring--logging)
12. [Disaster Recovery](#12-disaster-recovery)

---

## 1. System Overview

### High-Level Architecture

ChainGive operates on a **microservices architecture** with the following core services:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React Native │  │   Next.js    │  │ Admin Panel  │      │
│  │   (Mobile)   │  │    (Web)     │  │   (Internal) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Node.js)                     │
│            Authentication │ Rate Limiting │ Routing          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   User        │  │   Wallet      │  │  Matching     │
│   Service     │  │   Service     │  │  Service      │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                   │
        ▼                  ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  PostgreSQL   │  │  PostgreSQL   │  │   Redis       │
│  (Primary DB) │  │  (Wallet DB)  │  │   (Cache)     │
└───────────────┘  └───────────────┘  └───────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Blockchain Logger    │
                │  (Polygon Network)    │
                └───────────────────────┘
```

### Core Services

| Service | Responsibility | Tech Stack |
|---------|---------------|------------|
| **User Service** | Authentication, KYC, profiles | Node.js, Express, PostgreSQL |
| **Wallet Service** | Balances, transactions, escrow | Node.js, PostgreSQL, Redis |
| **Matching Service** | Donor-recipient pairing | Node.js, Redis, Algorithm Engine |
| **Marketplace Service** | Charity Coins, redemptions | Node.js, PostgreSQL |
| **Payment Service** | Flutterwave, Paystack, Opay integration | Node.js, Queue (Bull) |
| **Notification Service** | Push, SMS, email notifications | Node.js, Firebase, Twilio |
| **Blockchain Service** | Transaction logging to Polygon | Node.js, Web3.js |
| **Analytics Service** | Events, metrics, reporting | Node.js, Mixpanel, PostgreSQL |

---

## 2. Architecture Diagram

### System Architecture (Detailed)

```
┌───────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                 │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────┐         ┌────────────────┐                       │
│  │ React Native   │         │   Next.js      │                       │
│  │                │         │                │                       │
│  │ • Redux Toolkit│         │ • Server-Side  │                       │
│  │ • React Nav    │         │   Rendering    │                       │
│  │ • AsyncStorage │         │ • Static Gen   │                       │
│  └────────────────┘         └────────────────┘                       │
│         │                            │                                │
│         └────────────────┬───────────┘                                │
└──────────────────────────┼────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express)                             │
├───────────────────────────────────────────────────────────────────────┤
│  • JWT Authentication          • Rate Limiting (Redis)                │
│  • Request Validation          • CORS Configuration                   │
│  • API Versioning (/v1/)       • Error Handling                       │
└───────────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬────────────────┐
        ▼                  ▼                  ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ User Service │  │Wallet Service│  │Match Service │  │ Marketplace  │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│• Registration│  │• Balances    │  │• Algorithm   │  │• Listings    │
│• KYC/BVN     │  │• Deposits    │  │• Preferences │  │• Redemptions │
│• Profiles    │  │• Withdrawals │  │• Queuing     │  │• Inventory   │
│• Trust Score │  │• Escrow      │  │• Anti-gaming │  │• Partners    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │                │
        ▼                  ▼                  ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │ PostgreSQL   │  │    Redis     │  │ PostgreSQL   │
│   (Users)    │  │  (Wallets)   │  │   (Cache)    │  │(Marketplace) │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Payment Processors   │
                ├──────────────────────┤
                │ • Flutterwave        │
                │ • Paystack           │
                │ • Opay               │
                │ • Palmpay            │
                └──────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  Blockchain Logger   │
                ├──────────────────────┤
                │ • Polygon Network    │
                │ • PolygonScan API    │
                │ • IPFS (metadata)    │
                └──────────────────────┘
```

---

## 3. Technology Stack

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Mobile Framework** | React Native | 0.72+ | iOS & Android apps |
| **Web Framework** | Next.js | 14+ | Responsive web app |
| **State Management** | Redux Toolkit | 2.0+ | Client state |
| **Navigation** | React Navigation | 6+ | Mobile routing |
| **UI Library** | React Native Paper | 5+ | Component library |
| **Forms** | React Hook Form | 7+ | Form validation |
| **HTTP Client** | Axios | 1.6+ | API requests |
| **Local Storage** | AsyncStorage | 1.19+ | Offline data |

### Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 20 LTS | Server runtime |
| **Framework** | Express.js | 4.18+ | API framework |
| **Database** | PostgreSQL | 15+ | Primary datastore |
| **Cache** | Redis | 7+ | Session, queue, cache |
| **ORM** | Prisma | 5+ | Database ORM |
| **Authentication** | JWT + Passport | - | Auth strategy |
| **Queue** | Bull | 4+ | Background jobs |
| **Validation** | Joi | 17+ | Input validation |

### Blockchain

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Network** | Polygon (Mainnet) | Transaction logging |
| **Web3 Library** | Web3.js | Blockchain interaction |
| **Node Provider** | Alchemy | RPC endpoint |
| **Monitoring** | PolygonScan API | Transaction verification |

### DevOps

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hosting** | AWS (EC2, RDS, S3) | Infrastructure |
| **Container** | Docker | Containerization |
| **Orchestration** | Docker Compose | Local development |
| **CI/CD** | GitHub Actions | Automated deployment |
| **Monitoring** | New Relic | APM & error tracking |
| **Logging** | Winston + CloudWatch | Centralized logs |
| **CDN** | Cloudflare | Static assets |

---

## 4. Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │────────▶│   Wallets   │────────▶│Transactions │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                       │
      │                       │                       │
      ▼                       ▼                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ KYC_Records │         │   Escrows   │         │ Blockchain  │
└─────────────┘         └─────────────┘         │   Logs      │
                                                 └─────────────┘
      │
      ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Agents    │────────▶│Verification │         │   Cycles    │
└─────────────┘         └─────────────┘         └─────────────┘
                                                       │
                                                       ▼
                                                 ┌─────────────┐
                                                 │  Matches    │
                                                 └─────────────┘
```

### Core Tables

#### **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'beginner', -- beginner, agent, power_partner, csc_council
  tier INTEGER DEFAULT 1, -- 1 (Basic), 2 (Intermediate), 3 (Agent-Verified)
  trust_score DECIMAL(3,2) DEFAULT 5.00,
  total_cycles_completed INTEGER DEFAULT 0,
  total_donated DECIMAL(12,2) DEFAULT 0,
  total_received DECIMAL(12,2) DEFAULT 0,
  charity_coins_balance INTEGER DEFAULT 0,
  kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en', -- en, pidgin, yo, ha, ig
  location_city VARCHAR(100),
  location_state VARCHAR(100),
  location_country VARCHAR(2) DEFAULT 'NG',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_trust_score ON users(trust_score DESC);
```

#### **wallets**
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fiat_balance DECIMAL(12,2) DEFAULT 0.00, -- Available balance
  receivable_balance DECIMAL(12,2) DEFAULT 0.00, -- Locked in escrow
  pending_obligations DECIMAL(12,2) DEFAULT 0.00, -- Amount user owes forward
  total_inflows DECIMAL(12,2) DEFAULT 0.00,
  total_outflows DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX idx_wallets_user ON wallets(user_id);
```

#### **transactions**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_ref VARCHAR(100) UNIQUE NOT NULL, -- TXN-YYYYMMDD-XXXXX
  type VARCHAR(20) NOT NULL, -- deposit, withdrawal, donation_sent, donation_received, marketplace_redemption
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  fee DECIMAL(12,2) DEFAULT 0.00,
  net_amount DECIMAL(12,2) NOT NULL, -- amount - fee
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_transit, completed, failed, refunded
  payment_method VARCHAR(50), -- bank_transfer, opay, palmpay, flutterwave, paystack, crypto
  payment_provider_ref VARCHAR(255), -- External reference from Flutterwave, etc.
  cycle_id UUID REFERENCES cycles(id),
  metadata JSONB, -- Additional data (payment proof URL, notes, etc.)
  blockchain_tx_hash VARCHAR(66), -- Polygon transaction hash
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_ref ON transactions(transaction_ref);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
```

#### **escrows**
```sql
CREATE TABLE escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'holding', -- holding, released, refunded
  hold_until TIMESTAMP NOT NULL, -- Release after 48 hours
  released_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escrows_transaction ON escrows(transaction_id);
CREATE INDEX idx_escrows_status ON escrows(status);
CREATE INDEX idx_escrows_hold_until ON escrows(hold_until);
```

#### **cycles**
```sql
CREATE TABLE cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_transit, received, obligated, fulfilled, defaulted
  received_from_user_id UUID REFERENCES users(id),
  given_to_user_id UUID REFERENCES users(id),
  received_transaction_id UUID REFERENCES transactions(id),
  given_transaction_id UUID REFERENCES transactions(id),
  due_date DATE, -- Expected completion date (30-90 days from receipt)
  received_at TIMESTAMP,
  fulfilled_at TIMESTAMP,
  days_to_fulfill INTEGER, -- Calculated: fulfilled_at - received_at
  charity_coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cycles_user ON cycles(user_id);
CREATE INDEX idx_cycles_status ON cycles(status);
CREATE INDEX idx_cycles_due_date ON cycles(due_date);
```

#### **matches**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, expired, completed
  priority_score DECIMAL(5,2), -- Algorithm score
  matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Match valid for 24 hours
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_donor ON matches(donor_id);
CREATE INDEX idx_matches_recipient ON matches(recipient_id);
CREATE INDEX idx_matches_status ON matches(status);
```

#### **kyc_records**
```sql
CREATE TABLE kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  verification_type VARCHAR(20) NOT NULL, -- phone, email, bvn, nin, agent, selfie
  verification_data JSONB, -- BVN number, NIN, selfie URL, etc. (encrypted)
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  verified_by_user_id UUID REFERENCES users(id), -- Agent who verified (if applicable)
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_user ON kyc_records(user_id);
CREATE INDEX idx_kyc_status ON kyc_records(status);
```

#### **agents**
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  agent_code VARCHAR(20) UNIQUE NOT NULL, -- AG-LAG-001
  total_verifications INTEGER DEFAULT 0,
  total_commissions DECIMAL(12,2) DEFAULT 0.00,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_ratings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  suspended_until TIMESTAMP,
  suspension_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_agents_code ON agents(agent_code);
```

#### **marketplace_listings**
```sql
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- airtime, data, vouchers, services
  coin_price INTEGER NOT NULL, -- Charity Coins required
  real_value DECIMAL(12,2) NOT NULL, -- Actual NGN value
  stock_quantity INTEGER DEFAULT 0,
  is_in_stock BOOLEAN DEFAULT true,
  payment_methods TEXT[], -- ['bank_transfer', 'opay', 'palmpay']
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  total_redemptions INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marketplace_category ON marketplace_listings(category);
CREATE INDEX idx_marketplace_active ON marketplace_listings(is_active);
```

#### **redemptions**
```sql
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
  coins_spent INTEGER NOT NULL,
  real_value DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  delivery_method VARCHAR(50), -- instant, manual, voucher_code
  delivery_data JSONB, -- Voucher code, phone number credited, etc.
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_redemptions_user ON redemptions(user_id);
CREATE INDEX idx_redemptions_listing ON redemptions(listing_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);
```

#### **blockchain_logs**
```sql
CREATE TABLE blockchain_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  blockchain VARCHAR(20) DEFAULT 'polygon',
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price BIGINT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
  confirmations INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

CREATE INDEX idx_blockchain_tx ON blockchain_logs(transaction_id);
CREATE INDEX idx_blockchain_hash ON blockchain_logs(tx_hash);
```

---

## 5. API Documentation

### Authentication

All API requests require JWT authentication (except public endpoints).

**Base URL:** `https://api.chaingive.ng/v1`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Client-Version: 2.4.0
X-Platform: ios | android | web
```

### Endpoints

#### **Authentication**

**POST /auth/register**
```json
Request:
{
  "phone_number": "+2348012345678",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "Adeyemi",
  "last_name": "Okonkwo"
}

Response (201):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone_number": "+2348012345678",
      "email": "user@example.com",
      "first_name": "Adeyemi",
      "last_name": "Okonkwo",
      "role": "beginner",
      "tier": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "..."
  }
}
```

**POST /auth/login**
```json
Request:
{
  "phone_number": "+2348012345678",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "...",
    "refresh_token": "..."
  }
}
```

**POST /auth/verify-otp**
```json
Request:
{
  "phone_number": "+2348012345678",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "message": "Phone number verified"
}
```

#### **User Management**

**GET /users/me**
```json
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone_number": "+2348012345678",
    "email": "user@example.com",
    "first_name": "Adeyemi",
    "last_name": "Okonkwo",
    "role": "power_partner",
    "tier": 2,
    "trust_score": 4.85,
    "total_cycles_completed": 12,
    "charity_coins_balance": 245,
    "kyc_status": "approved",
    "wallet": {
      "fiat_balance": 5000.00,
      "pending_obligations": 3000.00
    }
  }
}
```

**PATCH /users/me**
```json
Request:
{
  "first_name": "Adeyemi",
  "location_city": "Lagos",
  "preferred_language": "yo"
}

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### **Wallet Operations**

**GET /wallet/balance**
```json
Response (200):
{
  "success": true,
  "data": {
    "fiat_balance": 5000.00,
    "receivable_balance": 2000.00,
    "pending_obligations": 3000.00,
    "charity_coins": 245
  }
}
```

**POST /wallet/deposit**
```json
Request:
{
  "amount": 5000.00,
  "payment_method": "bank_transfer",
  "payment_proof_url": "https://s3.../receipt.jpg" // Optional
}

Response (201):
{
  "success": true,
  "data": {
    "transaction_ref": "TXN-20251003-12345",
    "amount": 5000.00,
    "status": "pending",
    "payment_instructions": {
      "bank_name": "First Bank",
      "account_number": "1234567890",
      "account_name": "ChainGive Escrow"
    }
  }
}
```

**POST /wallet/withdraw**
```json
Request:
{
  "amount": 3000.00,
  "bank_code": "044", // Access Bank
  "account_number": "0123456789",
  "account_name": "Adeyemi Okonkwo"
}

Response (201):
{
  "success": true,
  "data": {
    "transaction_ref": "TXN-20251003-12346",
    "amount": 3000.00,
    "fee": 50.00,
    "net_amount": 2950.00,
    "status": "processing"
  }
}
```

#### **Donation Cycles**

**GET /cycles**
```json
Query Params:
?status=fulfilled&limit=10&offset=0

Response (200):
{
  "success": true,
  "data": {
    "cycles": [
      {
        "id": "uuid",
        "amount": 5000.00,
        "status": "fulfilled",
        "received_from": "Emeka O.",
        "given_to": "Fatima A.",
        "received_at": "2025-09-15T10:30:00Z",
        "fulfilled_at": "2025-09-25T14:20:00Z",
        "days_to_fulfill": 10,
        "charity_coins_earned": 50
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 10,
      "offset": 0
    }
  }
}
```

**POST /cycles/confirm-receipt**
```json
Request:
{
  "transaction_id": "uuid",
  "confirm": true
}

Response (200):
{
  "success": true,
  "message": "Receipt confirmed. Funds will be released in 48 hours.",
  "data": {
    "cycle_id": "uuid",
    "escrow_release_at": "2025-10-05T10:30:00Z"
  }
}
```

**POST /donations/give**
```json
Request:
{
  "amount": 5000.00,
  "recipient_preference": "algorithm", // or "manual"
  "recipient_id": "uuid", // If manual
  "location_preference": "Lagos",
  "faith_preference": "any"
}

Response (201):
{
  "success": true,
  "data": {
    "match_id": "uuid",
    "recipient": {
      "id": "uuid",
      "first_name": "Fatima",
      "location": "Lagos",
      "trust_score": 4.7
    },
    "amount": 5000.00,
    "expires_at": "2025-10-04T10:30:00Z"
  }
}
```

#### **Matching**

**GET /matches/pending**
```json
Response (200):
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "uuid",
        "donor": {
          "first_name": "Emeka",
          "location": "Lagos",
          "trust_score": 4.9
        },
        "amount": 5000.00,
        "matched_at": "2025-10-03T08:00:00Z",
        "expires_at": "2025-10-04T08:00:00Z"
      }
    ]
  }
}
```

**POST /matches/:id/accept**
```json
Response (200):
{
  "success": true,
  "message": "Match accepted. Awaiting donor transfer.",
  "data": {
    "match_id": "uuid",
    "transaction_ref": "TXN-20251003-12347"
  }
}
```

#### **Marketplace**

**GET /marketplace/listings**
```json
Query Params:
?category=airtime&limit=20&offset=0

Response (200):
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "uuid",
        "vendor_name": "MTN Nigeria",
        "item_name": "₦100 Airtime",
        "coin_price": 50,
        "real_value": 100.00,
        "rating": 4.8,
        "is_in_stock": true,
        "payment_methods": ["bank_transfer", "opay"]
      }
    ],
    "pagination": { ... }
  }
}
```

**POST /marketplace/redeem**
```json
Request:
{
  "listing_id": "uuid",
  "quantity": 1,
  "delivery_phone": "+2348012345678"
}

Response (201):
{
  "success": true,
  "data": {
    "redemption_id": "uuid",
    "coins_spent": 50,
    "status": "processing",
    "estimated_delivery": "Instant"
  }
}
```

### Error Responses

**Standard Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Your wallet balance is insufficient",
    "details": {
      "required": 5000.00,
      "available": 3500.00,
      "shortfall": 1500.00
    }
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate transaction)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 6. Blockchain Integration

### Polygon Network Configuration

**Network:** Polygon Mainnet  
**RPC Endpoint:** `https://polygon-mainnet.g.alchemy.com/v2/[API_KEY]`  
**Chain ID:** 137  
**Block Explorer:** https://polygonscan.com

### Smart Contract (Transaction Logger)

**Contract Address:** `0x...` (To be deployed)

**Purpose:** Log donation metadata on-chain for transparency and immutability.

**Functions:**

```solidity
// Log a donation transaction
function logDonation(
    string memory transactionRef,
    address donor,
    address recipient,
    uint256 amount,
    uint256 timestamp,
    string memory metadata
) external onlyAuthorized;

// Query transaction by reference
function getTransaction(string memory transactionRef) 
    external view returns (Transaction memory);
```

### Transaction Logging Flow

```
1. User confirms donation in app
2. Backend processes fiat transaction
3. Backend calls Polygon logger contract
4. Contract emits DonationLogged event
5. Backend stores tx_hash in blockchain_logs table
6. User sees blockchain link in transaction history
```

### Gas Management

- **Gas Limit:** 100,000 per transaction
- **Gas Price:** Dynamic (based on network congestion)
- **Fee Payer:** ChainGive platform (user doesn't pay gas)
- **Batching:** Log transactions in batches every 10 minutes to reduce costs

---

## 7. Security Architecture

### Authentication & Authorization

**JWT Configuration:**
```javascript
{
  algorithm: 'RS256', // RSA signatures
  expiresIn: '1h',
  issuer: 'chaingive.ng',
  audience: 'chaingive-api'
}
```

**Token Rotation:**
- Access token: 1 hour lifetime
- Refresh token: 30 days lifetime
- Automatic refresh on mobile app (background)

**Password Policy:**
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Hashed with bcrypt (cost factor: 12)

### Encryption

**Data at Rest:**
- Database: PostgreSQL native encryption (AES-256)
- Sensitive fields (BVN, NIN): Application-level encryption (AES-256-GCM)
- Encryption keys stored in AWS Secrets Manager

**Data in Transit:**
- TLS 1.3 for all API requests
- Certificate pinning on mobile apps
- HSTS enabled on web

### API Security

**Rate Limiting:**
```javascript
// Redis-based rate limiter
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests, please try again later'
}
```

**Input Validation:**
- All inputs validated with Joi schemas
- SQL injection prevention (Prisma ORM)
- XSS prevention (DOMPurify on frontend)

**CORS Configuration:**
```javascript
{
  origin: ['https://chaingive.ng', 'https://app.chaingive.ng'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
  maxAge: 86400
}
```

### Wallet Security

**Multi-Signature for High-Value:**
- Withdrawals >₦100,000 require 2-of-3 signatures
- Signers: CTO, CFO, Head of Operations

**Escrow Protection:**
- 48-hour hold period for all donations
- Automatic refund if recipient doesn't confirm
- Manual review for flagged transactions

**Fraud Detection:**
```javascript
// Auto-flag conditions
{
  multipleAccountsSameDevice: true,
  rapidTransactionVelocity: 10 per hour,
  suspiciousAmountPatterns: true,
  locationMismatch: true,
  deviceFingerprint: enabled
}
```

---

## 8. Infrastructure & Deployment

### AWS Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Route 53 (DNS)                     │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│          CloudFront (CDN) + WAF                      │
└──────────────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────┐           ┌──────────────┐
│  S3 Bucket   │           │ Load Balancer│
│ (Static Web) │           │    (ALB)     │
└──────────────┘           └──────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
        ┌────────────┐    ┌────────────┐    ┌────────────┐
        │   EC2      │    │   EC2      │    │   EC2      │
        │ (API - 1)  │    │ (API - 2)  │    │ (API - 3)  │
        └────────────┘    └────────────┘    └────────────┘
                │                 │                 │
                └─────────────────┼─────────────────┘
                                  ▼
                ┌──────────────────────────────────┐
                │        RDS (PostgreSQL)          │
                │      Multi-AZ, Encrypted         │
                └──────────────────────────────────┘
                                  │
                                  ▼
                ┌──────────────────────────────────┐
                │     ElastiCache (Redis)          │
                │         Cluster Mode             │
                └──────────────────────────────────┘
```

### Deployment Pipeline

```
GitHub → GitHub Actions → Docker Build → ECR → EC2 Auto-Scaling Group
   │
   └──→ Run Tests → Lint → Security Scan → Deploy to Staging → Manual Approval → Production
```

### Environment Configuration

| Environment | Purpose | URL | Database |
|-------------|---------|-----|----------|
| **Development** | Local dev | localhost:3000 | Local PostgreSQL |
| **Staging** | QA testing | staging.chaingive.ng | RDS (staging) |
| **Production** | Live users | api.chaingive.ng | RDS (Multi-AZ) |

### Auto-Scaling

**EC2 Auto-Scaling Rules:**
- Scale up: CPU >70% for 2 minutes
- Scale down: CPU <30% for 5 minutes
- Min instances: 2
- Max instances: 10

### Backup Strategy

**Database Backups:**
- Automated daily snapshots (RDS)
- Retention: 30 days
- Cross-region replication: Lagos → Dublin

**Application Backups:**
- Docker images stored in ECR
- S3 versioning enabled for uploads
- Config files in AWS Parameter Store

---

## 9. Third-Party Integrations

### Payment Processors

#### Flutterwave
```javascript
// Deposit flow
const response = await flutterwave.initiatePayment({
  tx_ref: 'TXN-20251003-12345',
  amount: 5000,
  currency: 'NGN',
  redirect_url: 'https://app.chaingive.ng/payment/callback',
  customer: {
    email: 'user@example.com',
    phone: '+2348012345678',
    name: 'Adeyemi Okonkwo'
  },
  payment_options: 'card,banktransfer,ussd'
});
```

#### Paystack
```javascript
// Withdrawal flow
const response = await paystack.createTransfer({
  source: 'balance',
  amount: 295000, // in kobo (₦2,950)
  recipient: recipientCode,
  reason: 'ChainGive withdrawal - TXN-20251003-12346'
});
```

### Identity Verification

#### BVN Verification (via Smile Identity)
```javascript
const verifyBVN = async (bvn, userId) => {
  const response = await smileIdentity.verify({
    country: 'NG',
    id_type: 'BVN',
    id_number: bvn,
    user_id: userId
  });
  
  return response.match; // true/false
};
```

#### NIN Verification (via NIMC API)
```javascript
const verifyNIN = async (nin) => {
  const response = await nimcAPI.get(`/verify/${nin}`, {
    headers: { 'Authorization': `Bearer ${NIMC_API_KEY}` }
  });
  
  return response.data;
};
```

### Notifications

#### Firebase Cloud Messaging (Push)
```javascript
await fcm.sendToDevice(userToken, {
  notification: {
    title: 'Donation Received',
    body: 'Emeka sent you ₦5,000. Confirm receipt now.',
    icon: 'ic_notification',
    sound: 'default'
  },
  data: {
    type: 'donation_received',
    transaction_id: 'uuid'
  }
});
```

#### Twilio (SMS)
```javascript
await twilio.messages.create({
  to: '+2348012345678',
  from: '+234XXXXXXXXX',
  body: 'ChainGive: Emeka donated ₦5,000 to you. Open app to confirm.'
});
```

### Analytics

#### Mixpanel
```javascript
mixpanel.track('Donation Completed', {
  amount: 5000,
  donor_id: 'uuid',
  recipient_id: 'uuid',
  payment_method: 'bank_transfer',
  days_to_complete: 10
});
```

---

## 10. Performance Specifications

### API Response Times (Target)

| Endpoint Type | Target | Max Acceptable |
|---------------|--------|----------------|
| **Authentication** | <200ms | 500ms |
| **User Data (GET)** | <100ms | 300ms |
| **Transactions (POST)** | <500ms | 1000ms |
| **Marketplace Listings** | <150ms | 400ms |
| **Matching Algorithm** | <300ms | 800ms |

### Database Performance

**Query Optimization:**
- All foreign keys indexed
- Composite indexes on frequently queried columns
- Query timeout: 5 seconds
- Connection pooling: 20 connections per instance

**Caching Strategy:**
```javascript
// Redis cache layers
{
  user_profile: '5 minutes',
  marketplace_listings: '15 minutes',
  trust_scores: '1 hour',
  leaderboards: '10 minutes'
}
```

### Mobile App Performance

**App Size:**
- Target: <15MB (APK/IPA)
- Asset optimization: WebP images, compressed fonts

**Startup Time:**
- Cold start: <3 seconds
- Warm start: <1 second

**Offline Capability:**
- View transaction history (cached)
- Browse marketplace (cached listings)
- Queue actions when offline, sync on reconnect

---

## 11. Monitoring & Logging

### Application Monitoring (New Relic)

**Metrics Tracked:**
- Response times (p50, p95, p99)
- Error rates
- Throughput (requests per minute)
- Apdex score (target: >0.85)

**Alerts:**
```javascript
{
  error_rate_high: '>5% for 5 minutes',
  response_time_slow: 'p95 >1s for 10 minutes',
  database_connections_low: '<10 available',
  cpu_usage_high: '>80% for 5 minutes'
}
```

### Logging (Winston + CloudWatch)

**Log Levels:**
- `error`: Critical failures
- `warn`: Potential issues
- `info`: Important events (transactions, logins)
- `debug`: Detailed debugging (dev only)

**Structured Logging:**
```javascript
logger.info('Donation completed', {
  transaction_ref: 'TXN-20251003-12345',
  amount: 5000,
  donor_id: 'uuid',
  recipient_id: 'uuid',
  duration_ms: 245
});
```

### Uptime Monitoring (Pingdom)

**Health Checks:**
- API health endpoint: `GET /health`
- Database connectivity
- Redis connectivity
- External service status (Flutterwave, Paystack)

**SLA Target:** 99.9% uptime (max 43 minutes downtime/month)

---

## 12. Disaster Recovery

### Backup & Restore

**RTO (Recovery Time Objective):** 4 hours  
**RPO (Recovery Point Objective):** 1 hour (max data loss)

**Disaster Scenarios:**

| Scenario | Recovery Plan |
|----------|---------------|
| **Database Failure** | Failover to RDS standby (automatic, <2 min) |
| **Region Outage** | Restore from cross-region backup (4 hours) |
| **Data Corruption** | Point-in-time restore from snapshot |
| **Security Breach** | Isolate affected systems, restore from clean backup |

### Incident Response

**Severity Levels:**

| Level | Definition | Response Time |
|-------|------------|---------------|
| **P0 - Critical** | Production down, data breach | <15 minutes |
| **P1 - High** | Major feature broken, payment failures | <1 hour |
| **P2 - Medium** | Minor feature broken | <4 hours |
| **P3 - Low** | Cosmetic issues, enhancement requests | <1 day |

**On-Call Rotation:**
- Primary: Lead Engineer
- Secondary: DevOps Engineer
- Escalation: CTO

---

## 📞 Technical Support

**For Developers:**
📧 dev@chaingive.ng  
📚 Developer Portal: https://docs.chaingive.ng  
🐙 GitHub: https://github.com/chaingive

**For System Issues:**
📧 ops@chaingive.ng  
📱 On-Call: +234-XXX-XXXX (P0 emergencies only)

---

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Next Review:** January 2026

*"Good architecture enables change." — Martin Fowler*
