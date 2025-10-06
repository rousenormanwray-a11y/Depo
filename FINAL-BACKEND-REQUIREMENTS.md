# 🎯 ChainGive Backend - Complete Requirements Analysis

**Based on:** Product Bible v2.4 + Agent Manual + Business Operations + Technical Architecture  
**Date:** October 6, 2025  
**Status:** Comprehensive Gap Analysis

---

## 📚 **What ChainGive Actually Is**

### Core Model
**ChainGive is a gamified P2P donation platform where:**

1. **Users participate in donation cycles**
   - Receive ₦X from User A
   - Pay forward ₦X to User B (not back to A)
   - Complete cycles to earn Charity Coins
   - Build trust score based on speed and consistency

2. **Charity Coins are the reward currency**
   - Earned by completing cycles quickly
   - Purchased from Agents (not payment gateways!)
   - Spent on:
     - Marketplace items (airtime, data, vouchers)
     - Leaderboard boosts (visibility, multipliers)

3. **Agents are the distribution network**
   - Verify user identities (KYC)
   - Sell Charity Coins to users (cash/bank transfer)
   - Buy coin inventory from Admin (via crypto)
   - Earn commissions (₦200/verification, 2% on deposits)

4. **Leaderboard creates competition**
   - Users ranked by donations, cycles, coins earned
   - Users spend coins to boost their position
   - Gamification drives engagement

---

## ✅ **What Backend Currently Has (70% Complete)**

### Database Schema ✅
- ✅ Users, Wallets, Transactions, Escrows
- ✅ Cycles, Matches, KycRecords
- ✅ Agents (basic), MarketplaceListings, Redemptions
- ✅ BlockchainLogs

### API Endpoints ✅
- ✅ Auth (register, login, OTP structure)
- ✅ User management
- ✅ Wallet operations
- ✅ Donation flow (give, confirm receipt)
- ✅ Cycles tracking
- ✅ Marketplace (browse, redeem)
- ✅ Matching algorithm

### Core Logic ✅
- ✅ JWT authentication
- ✅ Validation & error handling
- ✅ Trust score calculation
- ✅ Matching algorithm (proximity, trust, amount, wait time)
- ✅ Escrow structure (48-hour hold)
- ✅ Transaction logging

---

## ❌ **What's Actually Missing**

### 🔴 **CRITICAL GAPS (P0) - Blocks Launch**

---

#### 1. Agent Coin Inventory System
**Status:** ❌ Agent model exists but no coin management

**What's Needed:**

```prisma
// Update Agent model
model Agent {
  id                String   @id @default(uuid())
  userId            String   @unique
  agentCode         String   @unique
  
  // ADD THESE FIELDS:
  coinBalance       Int      @default(0)          // Current coin inventory
  totalCoinsStocked Int      @default(0)          // Total bought from admin
  totalCoinsSold    Int      @default(0)          // Total sold to users
  lifetimeRevenue   Decimal  @default(0)          // Cash collected from users
  
  // Relations
  coinPurchases     CoinPurchaseFromAdmin[]
  coinSales         CoinSaleToUser[]
}
```

**Endpoints:**
```typescript
GET  /v1/agents/coin-balance          // View inventory
GET  /v1/agents/coin-transactions      // Purchase/sale history
POST /v1/agents/low-stock-alert        // Alert when < 100 coins
```

**Effort:** 1 day

---

#### 2. Admin → Agent Coin Sales (Crypto Payments)
**Status:** ❌ Not implemented

**What's Needed:**

```prisma
model CoinPurchaseFromAdmin {
  id                  String    @id @default(uuid())
  agentId             String
  quantity            Int                        // Coins purchased
  pricePerCoin        Decimal                    // In USD/crypto
  totalAmount         Decimal                    // Total cost
  cryptocurrency      String                     // BTC, USDT, ETH
  paymentAddress      String                     // Admin's wallet address
  txHash              String?                    // Blockchain tx hash
  txProofUrl          String?                    // Screenshot from agent
  status              String    @default('pending') // pending, verifying, confirmed, rejected
  adminApprovedBy     String?
  approvedAt          DateTime?
  rejectionReason     String?
  createdAt           DateTime  @default(now())
  
  agent Agent @relation(fields: [agentId], references: [id])
}

model CryptoWallet {
  id            String   @id @default(uuid())
  currency      String              // BTC, USDT, ETH
  network       String              // TRC20, ERC20, BTC mainnet
  address       String   @unique
  isActive      Boolean  @default(true)
  createdBy     String              // Admin who created
  createdAt     DateTime @default(now())
}
```

**Endpoints:**

```typescript
// AGENT SIDE
POST /v1/agents/request-coin-purchase
{
  "quantity": 10000,
  "cryptocurrency": "USDT",
  "network": "TRC20"
}
// Returns admin wallet address to send payment

POST /v1/agents/submit-payment-proof
{
  "purchaseId": "uuid",
  "txHash": "0xabc123...",
  "proofScreenshot": "https://..."
}

// ADMIN SIDE
GET  /v1/admin/coin-purchase-requests    // Pending requests
POST /v1/admin/verify-crypto-payment     // Verify on blockchain
POST /v1/admin/approve-coin-purchase     // Credit agent's coinBalance
POST /v1/admin/reject-coin-purchase      // Reject with reason

GET  /v1/admin/crypto-wallets            // List payment addresses
POST /v1/admin/crypto-wallets            // Add new wallet address
```

**Flow:**
```
1. Agent requests 10,000 coins
2. System shows: "Send $1,000 USDT to TQn2C8..."
3. Agent sends crypto
4. Agent submits tx hash
5. Admin verifies on blockchain explorer
6. Admin approves
7. Agent coinBalance += 10,000
```

**Effort:** 3 days

---

#### 3. Agent → User Coin Sales
**Status:** ❌ Not implemented

**What's Needed:**

```prisma
model CoinSaleToUser {
  id              String    @id @default(uuid())
  agentId         String
  userId          String
  quantity        Int                           // Coins sold
  pricePerCoin    Decimal                       // In Naira (₦50/coin)
  totalAmount     Decimal                       // Total paid by user
  paymentMethod   String                        // cash, bank_transfer, opay, palmpay
  paymentProof    String?                       // Receipt/screenshot
  agentCommission Decimal                       // Agent's earning
  platformRevenue Decimal                       // Platform's cut
  createdAt       DateTime  @default(now())
  
  agent Agent @relation(fields: [agentId], references: [id])
  user  User  @relation(fields: [userId], references: [id])
}
```

**Endpoints:**

```typescript
POST /v1/agents/sell-coins
{
  "userPhone": "+2348012345678",
  "quantity": 100,
  "pricePerCoin": 50,
  "paymentMethod": "cash"
}

// Updates:
// - Agent coinBalance -= 100
// - User charityCoinsBalance += 100
// - Agent earns commission
// - Platform revenue recorded
```

**Pricing Logic:**
```typescript
// Admin sets base price
const basePriceNaira = 50; // ₦50 per coin

// Agent can add markup (10% max)
const agentMarkup = 1.05; // 5% markup
const finalPrice = basePriceNaira * agentMarkup;

// Commission split
const agentEarns = (finalPrice - basePriceNaira) * quantity;
const platformRevenue = basePriceNaira * quantity;
```

**Effort:** 1 day

---

#### 4. Leaderboard System
**Status:** ❌ Not implemented

**What's Needed:**

```prisma
model Leaderboard {
  id              String   @id @default(uuid())
  userId          String   @unique
  totalDonations  Decimal  @default(0)          // Sum of all donations
  cyclesCompleted Int      @default(0)          // Total cycles
  coinsEarned     Int      @default(0)          // Total coins earned
  avgCompletionDays Int    @default(0)          // Speed metric
  
  // Boost modifiers
  visibilityBoost Int      @default(0)          // Extra visibility points
  multiplierBoost Decimal  @default(1.0)        // Score multiplier (1.0-3.0x)
  positionBoost   Int      @default(0)          // Direct position boost
  
  // Calculated score
  totalScore      Decimal  @default(0)          // Final leaderboard score
  rank            Int?                          // Current rank (calculated)
  
  updatedAt       DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}

model LeaderboardBoost {
  id              String    @id @default(uuid())
  userId          String
  boostType       String              // visibility, multiplier, position
  coinsSpent      Int
  boostValue      Decimal             // Amount of boost applied
  expiresAt       DateTime?           // Some boosts are temporary
  isActive        Boolean  @default(true)
  createdAt       DateTime  @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

**Leaderboard Score Calculation:**
```typescript
function calculateLeaderboardScore(user: User): number {
  const baseScore = 
    (user.totalDonations * 0.4) +
    (user.cyclesCompleted * 100 * 0.3) +
    (user.coinsEarned * 10 * 0.2) +
    (speedBonus * 0.1);
  
  // Apply boosts
  const multiplier = user.multiplierBoost || 1.0;
  const visibility = user.visibilityBoost || 0;
  const position = user.positionBoost || 0;
  
  return (baseScore * multiplier) + visibility + position;
}
```

**Boost Types:**

| Boost Type | Cost (Coins) | Effect | Duration |
|-----------|--------------|--------|----------|
| **2x Multiplier** | 500 | Double score for 7 days | 7 days |
| **3x Multiplier** | 1000 | Triple score for 7 days | 7 days |
| **Visibility** | 300 | +1000 visibility points | 30 days |
| **Position Jump** | 200 | Move up 5 positions | Instant |

**Endpoints:**

```typescript
GET  /v1/leaderboard                   // Top 100 users
GET  /v1/leaderboard/me                // My position
GET  /v1/leaderboard/city/:city        // City rankings
GET  /v1/leaderboard/boosts            // Available boosts

POST /v1/leaderboard/boost
{
  "boostType": "multiplier",
  "duration": "7days",
  "coinsToSpend": 500
}
```

**Effort:** 2 days

---

#### 5. Background Jobs (Automated Processes)
**Status:** ❌ Not implemented

**What's Needed:**

```bash
npm install bull ioredis
```

**Jobs to Create:**

```typescript
// src/jobs/escrow-release.job.ts
// Runs: Every hour
// Purpose: Release 48-hour old escrows
export async function processEscrowReleases() {
  const readyEscrows = await prisma.escrow.findMany({
    where: {
      status: 'holding',
      holdUntil: { lt: new Date() }
    }
  });
  
  for (const escrow of readyEscrows) {
    await releaseEscrow(escrow.id);
    await awardCharityCoins(escrow.transaction.fromUserId, 50);
    await sendNotification(escrow.transaction.toUserId, 'Funds released!');
  }
}

// src/jobs/match-expiration.job.ts
// Runs: Every 6 hours
// Purpose: Expire 24-hour old matches
export async function expireMatches() {
  await prisma.match.updateMany({
    where: {
      status: 'pending',
      expiresAt: { lt: new Date() }
    },
    data: { status: 'expired' }
  });
}

// src/jobs/cycle-reminders.job.ts
// Runs: Daily at 9 AM
// Purpose: Remind users of pending obligations
export async function sendCycleReminders() {
  const dueIn7Days = await prisma.cycle.findMany({
    where: {
      status: 'obligated',
      dueDate: {
        gte: new Date(),
        lte: addDays(new Date(), 7)
      }
    }
  });
  
  for (const cycle of dueIn7Days) {
    await sendNotification(cycle.userId, 
      'Your cycle is due in 7 days. Ready to give forward?'
    );
  }
}

// src/jobs/leaderboard-recalculation.job.ts
// Runs: Daily at midnight
// Purpose: Recalculate all rankings
export async function recalculateLeaderboard() {
  const users = await prisma.user.findMany({
    include: { cycles: true, transactions: true }
  });
  
  for (const user of users) {
    const score = calculateLeaderboardScore(user);
    await prisma.leaderboard.upsert({
      where: { userId: user.id },
      update: { totalScore: score },
      create: { userId: user.id, totalScore: score }
    });
  }
  
  // Assign ranks
  const rankedUsers = await prisma.leaderboard.findMany({
    orderBy: { totalScore: 'desc' }
  });
  
  for (let i = 0; i < rankedUsers.length; i++) {
    await prisma.leaderboard.update({
      where: { id: rankedUsers[i].id },
      data: { rank: i + 1 }
    });
  }
}
```

**Effort:** 2 days

---

#### 6. Push Notifications (Firebase)
**Status:** ❌ Not implemented

**What's Needed:**

```bash
npm install firebase-admin
```

```prisma
model DeviceToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  platform  String              // ios, android, web
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

```typescript
// src/services/notification.service.ts
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  const tokens = await prisma.deviceToken.findMany({
    where: { userId, isActive: true },
    select: { token: true }
  });
  
  if (tokens.length === 0) return;
  
  await admin.messaging().sendMulticast({
    tokens: tokens.map(t => t.token),
    notification: { title, body },
    data,
  });
}

// Usage examples:
await sendPushNotification(
  userId,
  'Match Found!',
  'Emeka wants to give you ₦5,000'
);

await sendPushNotification(
  userId,
  'Escrow Released',
  'Funds are now in your wallet'
);

await sendPushNotification(
  userId,
  'Cycle Due Soon',
  'Your obligation is due in 7 days'
);
```

**Endpoints:**
```typescript
POST /v1/users/device-token
{
  "token": "fcm_token_here",
  "platform": "ios"
}

DELETE /v1/users/device-token/:token
```

**Effort:** 1 day

---

#### 7. SMS OTP Service (Real SMS)
**Status:** ⚠️ Console logging only

**What's Needed:**

```bash
npm install axios  # For Termii
```

```typescript
// src/services/sms.service.ts
import axios from 'axios';

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = 'ChainGive';

export async function sendSMS(phoneNumber: string, message: string) {
  try {
    const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
      to: phoneNumber,
      from: TERMII_SENDER_ID,
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: TERMII_API_KEY,
    });
    
    logger.info(`SMS sent to ${phoneNumber}`);
    return response.data;
  } catch (error) {
    logger.error('SMS send failed:', error);
    throw error;
  }
}

// Update OTP service
export async function sendOTP(phoneNumber: string): Promise<void> {
  const otp = generateOTP();
  await storeOTP(phoneNumber, otp);
  
  const message = `Your ChainGive verification code is: ${otp}. Valid for 5 minutes. Never share this code.`;
  
  await sendSMS(phoneNumber, message);
}
```

**Cost:** ~₦2.50 per SMS (Termii)  
**Effort:** 0.5 day

---

### Total P0 Effort: 11.5 days

---

## 🟡 **IMPORTANT GAPS (P1) - Needed for Beta**

#### 8. Payment Proof Upload (AWS S3)
**Status:** ❌ URLs only

```bash
npm install aws-sdk multer
```

**Effort:** 1 day

---

#### 9. Email Service (Nodemailer)
**Status:** ❌ Not implemented

**Templates Needed:**
- Welcome email
- Donation receipt
- Cycle reminder
- Dispute notification

**Effort:** 1 day

---

#### 10. Dispute System
**Status:** ⚠️ Basic flag exists

```prisma
model Dispute {
  id              String    @id @default(uuid())
  transactionId   String
  complainantId   String
  respondentId    String
  reason          String
  evidence        Json?
  status          String    @default('pending')
  cscAssignedTo   String?
  resolution      String?
  resolvedAt      DateTime?
  createdAt       DateTime  @default(now())
}
```

**Effort:** 1 day

---

#### 11. Admin Dashboard Endpoints
**Status:** ❌ Not implemented

```typescript
GET  /v1/admin/stats                     // Platform statistics
GET  /v1/admin/users                     // User management
POST /v1/admin/users/:id/ban             // Ban user
GET  /v1/admin/transactions              // All transactions
GET  /v1/admin/coin-purchase-requests    // Agent coin requests
POST /v1/admin/approve-coin-purchase     // Approve agent purchase
GET  /v1/admin/agents                    // Agent management
GET  /v1/admin/disputes                  // Active disputes
```

**Effort:** 2 days

---

### Total P1 Effort: 5 days

---

## 🟢 **NICE TO HAVE (P2) - Post-Launch**

#### 12. Blockchain Integration (Polygon)
**Purpose:** Transaction transparency

**Effort:** 5 days

---

#### 13. Analytics (Mixpanel)
**Purpose:** User behavior tracking

**Effort:** 2 days

---

#### 14. Advanced Security (2FA, Device Fingerprinting)
**Effort:** 3 days

---

### Total P2 Effort: 10 days

---

## ⏱️ **Timeline to Production**

### Conservative (30 days)

| Week | Focus | Features |
|------|-------|----------|
| **Week 1** | Agent Coin System | Inventory, Admin sales, User sales |
| **Week 2** | Leaderboard & Jobs | Rankings, Boosts, Automation |
| **Week 3** | Notifications & Comms | Push, SMS, Email |
| **Week 4** | Admin & Polish | Dashboard, Disputes, Testing |

### Aggressive (20 days)

| Week | Focus | Features |
|------|-------|----------|
| **Week 1-2** | P0 Features | All critical items |
| **Week 3** | P1 Features | Beta-ready items |
| **Week 4** | Polish & Deploy | Testing, deployment |

---

## 🎯 **Implementation Priority**

### Day 1-3: Agent Coin System
1. Add coin inventory fields to Agent model
2. Create CoinPurchaseFromAdmin model
3. Create CoinSaleToUser model
4. Build agent purchase request flow
5. Build admin approval workflow
6. Build agent-to-user sale endpoint

### Day 4-5: Leaderboard
7. Create Leaderboard models
8. Build score calculation logic
9. Create boost system
10. Build leaderboard endpoints

### Day 6-7: Background Jobs
11. Install Bull + Redis
12. Create escrow release job
13. Create match expiration job
14. Create cycle reminders job
15. Create leaderboard recalculation job

### Day 8: Notifications
16. Set up Firebase
17. Add device token storage
18. Create notification service
19. Integrate with key flows

### Day 9: SMS
20. Integrate Termii
21. Update OTP service
22. Test delivery

### Day 10-11: Admin Dashboard
23. Build admin endpoints
24. Create coin approval workflow
25. Add dispute management

### Day 12: Testing
26. Test complete flow
27. Fix bugs
28. Deploy to staging

---

## 💰 **Updated Cost Estimate**

| Service | Monthly Cost | Purpose |
|---------|--------------|---------|
| SMS (Termii) | ₦10,000 | ~4,000 OTPs/month |
| Firebase | Free | <10k users |
| Redis | Free | Bull queue |
| PostgreSQL | Free | Supabase/Neon |
| AWS S3 | ₦2,000 | File storage |
| **TOTAL** | **₦12k/mo** | **95% cheaper than with payment gateways!** |

---

## ✅ **Success Criteria**

After implementation, backend should support:

1. ✅ Agents buy coins from admin with crypto
2. ✅ Agents sell coins to users for cash
3. ✅ Users earn coins by completing cycles
4. ✅ Users spend coins on marketplace
5. ✅ Users spend coins to boost leaderboard
6. ✅ Leaderboard updates daily
7. ✅ Escrows auto-release after 48 hours
8. ✅ Push notifications sent for key events
9. ✅ SMS OTP delivered via Termii
10. ✅ Admin can manage coin purchases

---

## 🚀 **Bottom Line**

**Current Status:** 70% complete  
**Main Gaps:** Agent coin system, Leaderboard, Background jobs, Notifications  
**Time to MVP:** 12 days  
**Time to Beta:** 20 days  
**Time to Production:** 30 days

**The good news:** 
- Core architecture is solid ✅
- All gaps are straightforward to implement ✅
- No payment gateway complexity ✅
- Much simpler than originally thought ✅

**Next step:** Start with Agent Coin Inventory System (Day 1)

---

**Created:** October 6, 2025  
**Based on:** Complete documentation review  
**Status:** Ready for implementation
