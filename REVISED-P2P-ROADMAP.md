# 🔄 ChainGive P2P Backend - Revised Roadmap (No Payment Gateways)

**Platform Type:** Peer-to-Peer (Direct Transfers)  
**Payment Method:** Bank transfers, Mobile money, Cash (via agents)  
**Timeline:** 10 days to MVP

---

## 💡 Core P2P Flow (Without Payment Gateways)

```
1. User A wants to give ₦5,000
   ↓
2. System matches with User B (matching algorithm ✅ already built)
   ↓
3. User B provides bank account details
   ↓
4. User A transfers DIRECTLY to User B
   (via bank transfer, Opay, Palmpay, or cash through agent)
   ↓
5. User A uploads payment proof (optional)
   ↓
6. User B confirms receipt
   ↓
7. System holds in escrow for 48 hours
   ↓
8. System releases and User B gets obligation to pay forward
   ↓
9. User B earns Charity Coins when fulfilled
```

**Key Insight:** No Flutterwave/Paystack needed! The backend just tracks and confirms P2P transfers.

---

## ✅ What's Already Built for P2P

- ✅ Matching algorithm (finds best recipient)
- ✅ Transaction tracking
- ✅ Escrow structure (48-hour hold)
- ✅ Cycle management (obligation tracking)
- ✅ Charity Coins system
- ✅ Agent network for cash deposits
- ✅ Trust score system

**This already works for P2P!** Just needs a few additions.

---

## ❌ What's Actually Missing for P2P

### 🔴 CRITICAL (P0) - 7 days

#### 1. Bank Account Management
**Status:** ❌ Not implemented  
**Why Critical:** Users need to know where to send money

**Files to Create:**
```
src/controllers/bankAccount.controller.ts
src/routes/bankAccount.routes.ts
src/validations/bankAccount.validation.ts
```

**Add to Prisma Schema:**
```prisma
model BankAccount {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  bankName      String   @map("bank_name")
  accountNumber String   @map("account_number")
  accountName   String   @map("account_name")
  isPrimary     Boolean  @default(false) @map("is_primary")
  createdAt     DateTime @default(now()) @map("created_at")
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("bank_accounts")
}
```

**Endpoints Needed:**
```typescript
POST /v1/users/bank-accounts      // Add bank account
GET  /v1/users/bank-accounts       // List accounts
PATCH /v1/users/bank-accounts/:id // Update account
DELETE /v1/users/bank-accounts/:id // Remove account
```

**Effort:** 1 day

---

#### 2. Payment Proof Upload
**Status:** ❌ Not implemented  
**Why Critical:** Users need to prove they sent money

**Options:**

**A. Simple URL Storage (Quick)**
```typescript
// Just store image URLs in transaction metadata
{
  "paymentProofUrl": "https://example.com/receipt.jpg"
}
```
**Effort:** 30 minutes

**B. AWS S3 Upload (Better)**
```bash
npm install aws-sdk multer
```
**Effort:** 1 day

**C. Cloudinary Upload (Easiest)**
```bash
npm install cloudinary
```
**Effort:** 2 hours

**Recommended:** Start with Option A (URL storage), add S3 later

---

#### 3. SMS OTP Service
**Status:** ❌ Console only  
**Why Critical:** Phone verification required

**Options:**

**A. Twilio (International)**
```bash
npm install twilio
```
- Cost: ₦4 per SMS
- Setup: 2 hours

**B. Termii (Nigerian)**
```bash
npm install axios
```
- Cost: ₦2.50 per SMS
- Better for Nigeria
- Setup: 2 hours

**C. SMS.to (Cheapest)**
- Cost: ₦1.50 per SMS
- Setup: 1 hour

**Recommended:** Termii (Nigerian-focused)

**Effort:** 0.5 day

---

#### 4. Background Jobs (Automated Processes)
**Status:** ❌ Not implemented  
**Why Critical:** Escrows never auto-release

**Dependencies:**
```bash
npm install bull ioredis
```

**Jobs Needed:**

1. **Escrow Release** (48 hours after confirmation)
```typescript
// src/jobs/escrow-release.job.ts
export async function processEscrowRelease(escrowId: string) {
  const escrow = await prisma.escrow.findUnique({
    where: { id: escrowId },
    include: { transaction: true },
  });

  if (escrow.status === 'holding' && new Date() > escrow.holdUntil) {
    await prisma.$transaction([
      // Update escrow
      prisma.escrow.update({
        where: { id: escrowId },
        data: { status: 'released', releasedAt: new Date() },
      }),
      // Credit recipient wallet
      prisma.wallet.update({
        where: { userId: escrow.transaction.toUserId },
        data: {
          fiatBalance: { increment: escrow.amount },
          receivableBalance: { decrement: escrow.amount },
        },
      }),
      // Award Charity Coins
      prisma.user.update({
        where: { id: escrow.transaction.fromUserId },
        data: {
          charityCoinsBalance: { increment: 50 }, // 50 coins per donation
        },
      }),
    ]);
  }
}
```

2. **Match Expiration** (24 hours)
3. **Cycle Due Reminders** (7 days before)

**Effort:** 2 days

---

#### 5. Push Notifications
**Status:** ❌ Not implemented  
**Why Critical:** User engagement

**Firebase Setup:**
```bash
npm install firebase-admin
```

**Notifications Needed:**
- Match found
- Transfer received
- Escrow released
- Cycle due soon

**Effort:** 1 day

---

#### 6. Manual Transfer Confirmation Flow
**Status:** ⚠️ Partially built  
**Why Critical:** Core P2P feature

**Current:** `POST /donations/confirm-receipt` exists  
**Missing:** Payment proof handling, dispute flow

**Updates Needed:**

```typescript
// src/controllers/donation.controller.ts (update)
export const confirmReceipt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { transactionId, confirm, paymentProofUrl } = req.body;
  
  if (confirm) {
    // Create 48-hour escrow
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'in_escrow',
          metadata: { paymentProofUrl },
        },
      }),
      prisma.escrow.create({
        data: {
          transactionId,
          amount: transaction.amount,
          status: 'holding',
          holdUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      }),
    ]);
    
    // Schedule auto-release job
    await scheduleEscrowRelease(escrow.id, escrow.holdUntil);
    
    // Notify donor
    await sendPushNotification(
      transaction.fromUserId,
      'Receipt Confirmed',
      'Funds are in escrow. Will be released in 48 hours.'
    );
  } else {
    // Dispute - notify admin
    await createDispute(transactionId, req.user.id);
  }
};
```

**Effort:** 1 day

---

### Total P0 Effort: 7 days

---

## 🟡 IMPORTANT (P1) - 3 days

#### 7. Email Notifications (Alternative to SMS)
**Why:** Backup communication channel

**Templates:**
- Welcome email
- Transfer instructions
- Receipt confirmation
- Dispute notification

**Effort:** 1 day

---

#### 8. Transaction Dispute System
**Why:** Handle transfer issues

**Files:**
```
src/models/dispute.model.ts (add to Prisma)
src/controllers/dispute.controller.ts
src/routes/dispute.routes.ts
```

**Endpoints:**
```typescript
POST /v1/disputes           // Create dispute
GET  /v1/disputes           // List user disputes
GET  /v1/disputes/:id       // Dispute details
POST /v1/disputes/:id/resolve // Resolve (admin only)
```

**Effort:** 1 day

---

#### 9. Transfer Instructions Generator
**Why:** Help users know exactly how to send money

```typescript
// src/services/transferInstructions.service.ts
export function generateTransferInstructions(match: Match) {
  const recipient = match.recipient;
  const bankAccount = recipient.primaryBankAccount;
  
  return {
    amount: match.amount,
    recipientName: `${recipient.firstName} ${recipient.lastName}`,
    bankName: bankAccount.bankName,
    accountNumber: bankAccount.accountNumber,
    accountName: bankAccount.accountName,
    reference: match.id, // For tracking
    instructions: [
      "1. Open your bank app or visit your bank",
      `2. Transfer ₦${match.amount} to the account above`,
      "3. Use the match ID as reference",
      "4. Take a screenshot of the receipt",
      "5. Come back and upload proof",
    ],
  };
}
```

**Effort:** 0.5 day

---

#### 10. Admin Dashboard for Manual Verification
**Why:** Handle disputes and verify transfers

**Endpoints:**
```typescript
GET  /v1/admin/pending-confirmations  // Unconfirmed transfers
GET  /v1/admin/disputes               // Active disputes
POST /v1/admin/verify-transfer        // Manually verify
POST /v1/admin/refund                 // Process refund
```

**Effort:** 0.5 day

---

### Total P1 Effort: 3 days

---

## 📅 10-Day MVP Roadmap

### Day 1-2: Bank Account Management
- [x] Add BankAccount model to Prisma
- [ ] Create bank account endpoints
- [ ] Test adding/listing accounts
- [ ] Update donation flow to show recipient account

### Day 3: Payment Proof & Transfer Flow
- [ ] Add payment proof URL to transactions
- [ ] Update confirm receipt endpoint
- [ ] Add transfer instructions generator
- [ ] Test full P2P flow

### Day 4-5: Background Jobs
- [ ] Install Bull + Redis
- [ ] Create escrow release job
- [ ] Create match expiration job
- [ ] Test automated processes

### Day 6: SMS OTP
- [ ] Sign up for Termii
- [ ] Integrate SMS sending
- [ ] Test OTP delivery
- [ ] Update auth flow

### Day 7: Push Notifications
- [ ] Set up Firebase
- [ ] Add device token storage
- [ ] Create notification templates
- [ ] Test on real devices

### Day 8: Email Service
- [ ] Set up Nodemailer
- [ ] Create email templates
- [ ] Send welcome/instruction emails
- [ ] Test email delivery

### Day 9: Dispute System
- [ ] Add Dispute model
- [ ] Create dispute endpoints
- [ ] Add admin review flow
- [ ] Test dispute resolution

### Day 10: Testing & Polish
- [ ] Test complete P2P flow
- [ ] Fix bugs
- [ ] Update documentation
- [ ] Deploy to staging

---

## 💰 Updated Cost Estimate (P2P Model)

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| SMS (Termii) | ₦10,000 | ~4,000 SMS/month |
| Firebase | Free | <10k users |
| Email (SMTP) | Free | Gmail SMTP |
| Redis Cloud | Free | 30MB free tier |
| PostgreSQL | Free | Supabase/Neon free tier |
| **TOTAL** | **₦10k/mo** | 90% cheaper! |

**No payment gateway fees!** 🎉

---

## 🔄 Updated P2P User Flow

### For Donors (Giving Money)

1. **Initiate Donation**
   ```
   POST /v1/donations/give
   {
     "amount": 5000,
     "recipientPreference": "algorithm"
   }
   ```

2. **Get Match + Transfer Instructions**
   ```json
   {
     "match": {
       "recipient": "Fatima A.",
       "amount": 5000,
       "bankDetails": {
         "bankName": "GTBank",
         "accountNumber": "0123456789",
         "accountName": "Fatima Abubakar"
       },
       "instructions": [...]
     }
   }
   ```

3. **Transfer Money** (Outside app - via bank app, Opay, etc.)

4. **Upload Proof** (Optional)
   ```
   POST /v1/transactions/:id/proof
   {
     "proofUrl": "https://..."
   }
   ```

5. **Wait for Confirmation**

6. **Get Notification** when released

### For Recipients (Receiving Money)

1. **Get Match Notification**
   - Push: "You have a match! Emeka wants to give you ₦5,000"

2. **Check Bank Account**

3. **Confirm Receipt**
   ```
   POST /v1/donations/confirm-receipt
   {
     "transactionId": "uuid",
     "confirm": true
   }
   ```

4. **Wait 48 Hours** (Escrow)

5. **Money Released**

6. **Obligation Created** (Pay forward in 30-90 days)

---

## ✅ What We DON'T Need Anymore

~~1. Flutterwave integration~~ (Users transfer directly)  
~~2. Paystack integration~~ (Users transfer directly)  
~~3. Payment webhooks~~ (Manual confirmation instead)  
~~4. Wallet top-up~~ (No central wallet)  
~~5. Automated withdrawals~~ (Direct bank transfers)

**This makes everything simpler!** 🎉

---

## 🎯 Revised Success Criteria

### MVP (Day 10)
- ✅ Users can add bank accounts
- ✅ System matches donors & recipients
- ✅ Donors get bank details to transfer
- ✅ Recipients confirm receipt
- ✅ Escrow auto-releases after 48 hours
- ✅ Obligations tracked
- ✅ Charity Coins awarded
- ✅ SMS OTP works
- ✅ Push notifications sent

### Beta (Day 20)
- ✅ Email notifications
- ✅ Dispute system
- ✅ Admin verification
- ✅ Payment proof uploads
- ✅ Agent cash deposits

### Production (Day 30)
- ✅ Testing complete
- ✅ Documentation updated
- ✅ Deployed and monitored
- ✅ Ready for 1,000 users

---

## 🚀 Quick Start (This Week)

### Monday
```bash
# Add bank account model to Prisma
npx prisma migrate dev --name add_bank_accounts

# Create bank account endpoints
# Test adding bank account
```

### Tuesday
```bash
# Update donation flow
# Add transfer instructions
# Test match + instructions flow
```

### Wednesday
```bash
# Sign up for Termii (SMS)
# Get API key
# Integrate SMS OTP
# Test SMS delivery
```

### Thursday-Friday
```bash
# Install Bull + Redis
# Create escrow release job
# Schedule jobs
# Test automated escrow release
```

**Weekend:** Firebase push notifications

---

## 💡 Why P2P is Better

### Advantages
1. **No payment gateway fees** (save 1.4% + ₦100 per transaction)
2. **Faster settlements** (direct to recipient)
3. **More payment options** (any bank, mobile money, cash)
4. **Lower operational costs** (₦10k/mo vs ₦50k+/mo)
5. **More transparent** (users see exact amounts)

### Challenges
1. **Manual confirmation** (not instant)
2. **Dispute handling** (requires admin)
3. **Payment proof** (users must screenshot)
4. **Trust required** (48-hour escrow helps)

### Mitigation
- ✅ Trust score system (already built)
- ✅ Escrow protection (already built)
- ✅ Agent verification (already built)
- ✅ Dispute system (to be built)

---

## 🎉 Bottom Line

**Skipping payment gateways makes this:**
- ✅ **Simpler** - Less code, less complexity
- ✅ **Cheaper** - 90% cost reduction
- ✅ **Faster** - 10 days to MVP vs 30 days
- ✅ **More flexible** - Any payment method works
- ✅ **True P2P** - Matches the vision better

**Your instinct was right!** This is the way to go for a P2P platform. 🚀

---

**Next Step:** Start with Day 1 - Add bank account management!
