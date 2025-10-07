# 💼 **ChainGive Business Operations Manual**

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Document Owner:** Operations Team

---

## 📖 Table of Contents

1. [Financial Reconciliation Procedures](#1-financial-reconciliation-procedures)
2. [Escrow Management Protocol](#2-escrow-management-protocol)
3. [Marketplace Vendor Onboarding](#3-marketplace-vendor-onboarding)
4. [Customer Support Escalation Matrix](#4-customer-support-escalation-matrix)
5. [Agent Network Management](#5-agent-network-management)
6. [Compliance Reporting](#6-compliance-reporting)
7. [Crisis Response Protocols](#7-crisis-response-protocols)
8. [Monthly Operations Checklist](#8-monthly-operations-checklist)

---

## 1. Financial Reconciliation Procedures

### 1.1 Daily Reconciliation

**Performed By:** Finance Team  
**Time:** 9:00 AM daily  
**Duration:** 30-45 minutes

#### Steps

**1. Bank Account Reconciliation**

```
Compare:
- ChainGive bank account balance (Flutterwave, Paystack, Opay)
- System wallet balance (PostgreSQL database)
- Escrow holdings (separate table)

Expected: Bank Balance = Wallet Balance + Escrow Holdings
```

**Checklist:**
- [ ] Export bank statements (last 24 hours)
- [ ] Run SQL query: `SELECT SUM(fiat_balance) FROM wallets`
- [ ] Run SQL query: `SELECT SUM(amount) FROM escrows WHERE status='holding'`
- [ ] Calculate: `Bank - (Wallet + Escrow)` = Should be ₦0
- [ ] If discrepancy >₦1,000: Flag for manual review

**2. Transaction Matching**

```sql
-- Unmatched deposits (payment processor shows paid, system hasn't credited)
SELECT *
FROM transactions
WHERE type = 'deposit'
  AND status = 'pending'
  AND created_at < NOW() - INTERVAL '1 hour';
```

**Action:**
- Investigate payment processor logs
- Credit user manually if confirmed
- Document reason for delay

**3. Escrow Releases**

```sql
-- Escrows due for release (48 hours passed)
SELECT *
FROM escrows
WHERE status = 'holding'
  AND hold_until < NOW();
```

**Action:**
- Auto-release to recipient wallet
- Update transaction status to 'completed'
- Log blockchain transaction

---

### 1.2 Weekly Reconciliation

**Performed By:** CFO  
**Time:** Every Monday, 10:00 AM  
**Duration:** 2 hours

#### Reports to Generate

**1. Revenue Report**

| Revenue Stream | Amount (₦) | % of Total |
|----------------|-----------|------------|
| Transaction fees (2%) | ___ | ___ |
| Marketplace margin (10-15%) | ___ | ___ |
| Agent network fees (5%) | ___ | ___ |
| **Total** | **___** | **100%** |

**2. Liability Report**

| Liability | Amount (₦) |
|-----------|-----------|
| User wallet balances | ___ |
| Escrow holdings | ___ |
| Pending withdrawals | ___ |
| Agent commissions owed | ___ |
| **Total** | **___** |

**Expected:** Assets (bank balance) ≥ Liabilities

**3. Charity Coin Liability**

```sql
-- Total Charity Coins issued (marketplace value)
SELECT 
  SUM(charity_coins_balance * 2) AS coin_value_ngn
FROM users;
-- Multiply by 2 because 1 Coin ≈ ₦2 real value
```

**Reserve Requirement:** Maintain 15% of Coin liability in reserve

---

### 1.3 Monthly Reconciliation

**CBN Reporting Requirements:**

- [ ] Submit transaction volume report to NIBSS
- [ ] AML suspicious activity report (if any)
- [ ] Agent network audit summary
- [ ] Customer complaint resolution metrics

---

## 2. Escrow Management Protocol

### 2.1 Escrow Lifecycle

```
Donation Sent → Escrow Created (48hr hold) → Recipient Confirms → Escrow Released
     │                                              │
     │                                              ▼
     └──────────────────────────────────> Dispute Raised → Manual Review
```

### 2.2 Standard Escrow (48-Hour Hold)

**Creation:**
```sql
INSERT INTO escrows (transaction_id, amount, hold_until)
VALUES (
  'uuid',
  5000.00,
  NOW() + INTERVAL '48 hours'
);
```

**Auto-Release (Cron Job runs every hour):**
```sql
UPDATE escrows
SET status = 'released', released_at = NOW()
WHERE status = 'holding'
  AND hold_until < NOW();

-- Credit recipient wallet
UPDATE wallets
SET fiat_balance = fiat_balance + <amount>
WHERE user_id = <recipient_id>;
```

### 2.3 Disputed Escrows

**Trigger:** User reports "didn't receive donation"

**Manual Review Checklist:**
- [ ] Check payment processor confirmation (Flutterwave, Paystack)
- [ ] Verify account number matches recipient
- [ ] Review recipient's transaction history (pattern of disputes?)
- [ ] Contact recipient for clarification (via SMS/email)
- [ ] Review donor's evidence (screenshot, receipt)

**Decision Matrix:**

| Evidence | Action |
|----------|--------|
| Donor sent to wrong account | Refund donor, instruct to resend |
| Recipient lying | Release to donor, flag recipient |
| Payment processor error | Contact processor, manual credit if confirmed |
| Unclear | Escalate to CSC Council |

**Resolution Time:** 7 days maximum

---

## 3. Marketplace Vendor Onboarding

### 3.1 Vendor Application Process

**Step 1: Vendor Submits Application**

**Required Information:**
- Company name and registration number (CAC)
- Contact person (name, email, phone)
- Product/service category (airtime, data, vouchers, etc.)
- Pricing structure
- Stock availability guarantees
- Delivery method (instant, manual, API)

**Step 2: Due Diligence (3-5 days)**

**Checklist:**
- [ ] Verify CAC registration (Corporate Affairs Commission)
- [ ] Check business reputation (Google reviews, TechCabal, etc.)
- [ ] Request sample product (test redemption)
- [ ] Verify tax compliance (TIN)
- [ ] Background check on contact person

**Step 3: Commercial Terms Negotiation**

**Standard Agreement:**
- ChainGive margin: 10-15%
- Payment terms: Net 15 days
- Stock updates: Real-time API or daily manual
- Refund policy: 100% Charity Coins if non-delivery
- SLA: 95% uptime, <5 min delivery time (instant items)

**Step 4: Technical Integration**

**Option A: API Integration**
```
Vendor provides:
- API endpoint: POST /redeem
- Authentication: API key
- Payload: { listing_id, quantity, delivery_phone }
- Response: { status, voucher_code, delivery_time }
```

**Option B: Manual Fulfillment**
- ChainGive sends email with redemption details
- Vendor fulfills within SLA
- Vendor confirms delivery via dashboard

**Step 5: Go Live**

- [ ] Add vendor listings to Marketplace
- [ ] Set initial stock quantities
- [ ] Monitor first 10 redemptions closely
- [ ] Collect user feedback (ratings)

---

### 3.2 Vendor Performance Monitoring

**Monthly Scorecard:**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Delivery success rate | >95% | ___% | ⬜ |
| Avg delivery time (instant items) | <5 min | ___ min | ⬜ |
| User rating | >4.5/5 | ___ | ⬜ |
| Refund rate | <2% | ___% | ⬜ |

**Penalties:**
- Rating <4.0 for 2 consecutive months → Warning
- Delivery success <90% → Suspension (30 days)
- Fraud detected → Immediate termination + legal action

---

## 4. Customer Support Escalation Matrix

### 4.1 Support Tiers

**Tier 1: Self-Service (Instant)**
- In-app FAQ (100+ questions)
- Chatbot (handles 70% of queries)
- Video tutorials

**Tier 2: Live Support (<2 hours)**
- WhatsApp: +234-XXX-XXXX
- In-app chat
- Email: support@chaingive.ng

**Tier 3: Escalation (<24 hours)**
- Technical issues → Engineering team
- Fraud cases → Compliance team
- Payment issues → Finance team

**Tier 4: CSC Council (7-14 days)**
- User disputes (mediation)
- Policy violations (account suspensions)

---

### 4.2 Issue Categories & Response Templates

#### **Category 1: Transaction Not Received**

**Template:**
```
Hi [User Name],

Thank you for contacting ChainGive Support.

I've reviewed your account and can see:
• Donor: [Name]
• Amount: ₦[Amount]
• Sent: [Date/Time]
• Status: [Pending/In Transit/etc.]

Next Steps:
[If pending] → The donor has 48 hours to complete transfer. We'll notify you when confirmed.
[If delayed] → I've escalated to our payments team. Expect update within 4 hours.

Your Transaction ID: [TXN-XXXXX]

Need immediate help? WhatsApp us: +234-XXX-XXXX

Best,
[Agent Name]
ChainGive Support
```

#### **Category 2: Charity Coins Not Credited**

**Template:**
```
Hi [User Name],

Charity Coins are credited based on cycle completion speed:
• <14 days: 50 Coins
• 15-30 days: 30 Coins
• 31-60 days: 10 Coins

Your Cycle:
• Received: [Date]
• Gave Forward: [Date]
• Days: [X] days
• Coins Earned: [Y] Coins ✅

If you believe this is incorrect, please reply with your Cycle ID and we'll review.

Best,
[Agent Name]
```

#### **Category 3: Account Suspended**

**Template:**
```
Hi [User Name],

Your account was suspended on [Date] for: [Reason].

This is a temporary measure while we investigate. You may:
1. Appeal: Submit evidence via support@chaingive.ng
2. Wait for review: Compliance team will contact you within 7 days

Your wallet balance (₦[Amount]) is safe and will be accessible after resolution.

We take platform integrity seriously. Thank you for your patience.

Best,
Compliance Team
```

---

### 4.3 Escalation Flowchart

```
User Submits Ticket
    │
    ▼
Chatbot Response (Tier 1)
    │
    ├─ Resolved? → Close Ticket
    │
    ▼ Not Resolved
Live Agent (Tier 2)
    │
    ├─ Technical Issue → Engineering (Tier 3)
    ├─ Fraud Suspicion → Compliance (Tier 3)
    ├─ Payment Issue → Finance (Tier 3)
    │
    ▼ Still Unresolved
CSC Council (Tier 4)
    │
    ▼
External Arbitration (if needed)
```

**SLA:**
- Tier 1: Instant
- Tier 2: <2 hours (business hours)
- Tier 3: <24 hours
- Tier 4: <14 days

---

## 5. Agent Network Management

### 5.1 Agent Recruitment

**Target:** 50 agents (Month 1) → 200 agents (Month 6) → 500 agents (Month 12)

**Recruitment Channels:**
- Existing POS agents (Moniepoint, OPay)
- Market associations (Lagos Traders, Kano Merchants)
- Referrals (current agents earn ₦500 per recruit)

**Selection Criteria:**
- Trust score 4.5+
- Completed 5+ cycles
- Verified identity (BVN + NIN)
- Pass background check

---

### 5.2 Agent Training

**Onboarding (2 hours, self-paced):**
- Module 1: Platform basics (30 min)
- Module 2: Agent responsibilities (45 min)
- Module 3: Customer service (30 min)
- Module 4: Tools & systems (15 min)
- Final quiz (10 questions, 80% pass)

**Ongoing Training (Monthly):**
- Virtual meetups (last Saturday of month)
- Product updates
- Best practices sharing
- Q&A session

---

### 5.3 Agent Performance Management

**Monthly Review:**

| Agent | Verifications | Cash Deposits | Trust Rating | Status |
|-------|---------------|---------------|--------------|--------|
| AG-LAG-001 | 45 | ₦420,000 | 4.8 | Active ✅ |
| AG-LAG-002 | 12 | ₦80,000 | 4.2 | Warning ⚠️ |
| AG-LAG-003 | 3 | ₦20,000 | 3.8 | Probation 🔴 |

**Actions:**
- Active (4.5+): Continue + recognition
- Warning (4.0-4.4): Retraining required
- Probation (<4.0): 30-day improvement plan or suspension

**Top Agent Rewards:**
- Monthly Top 10: ₦5,000 bonus
- Quarterly Best Agent: ₦20,000 + featured story
- Annual Summit: All-expenses-paid event

---

## 6. Compliance Reporting

### 6.1 CBN Monthly Report

**Due:** 5th of each month  
**Submitted To:** Central Bank of Nigeria (via NIBSS portal)

**Report Contents:**

**1. Transaction Volume**
| Metric | Value |
|--------|-------|
| Total transactions | ___ |
| Total value (₦) | ___ |
| Avg transaction size | ___ |
| Unique users | ___ |

**2. KYC Tier Breakdown**
| Tier | Users | % of Total |
|------|-------|------------|
| Tier 1 | ___ | ___% |
| Tier 2 | ___ | ___% |
| Tier 3 | ___ | ___% |

**3. Suspicious Activity**
- Number of flagged transactions: ___
- SARs filed with NFIU: ___

---

### 6.2 NDPR Quarterly Report

**Due:** 15th of Jan, Apr, Jul, Oct  
**Submitted To:** NITDA

**Report Contents:**
- Data breaches (if any): ___
- User data requests fulfilled: ___
- Privacy policy updates: ___
- Third-party processors: [List]

---

## 7. Crisis Response Protocols

### 7.1 Bank Run Scenario

**Trigger:** >20% of users attempt withdrawal same day

**Response Team:**
- Incident Commander: CEO
- Finance: CFO
- Communications: Head of Marketing
- Technical: CTO

**Actions (First Hour):**
1. **Assess Liquidity**
   - Check bank balance
   - Check escrow reserves
   - Calculate max withdrawal capacity

2. **Implement Controls**
   - Reduce withdrawal limit (₦50,000 → ₦20,000/day)
   - Extend processing time (instant → 24 hours)
   - Communicate transparently to users

3. **Secure Additional Funds**
   - Contact investors for emergency bridge
   - Liquidate reserve assets
   - Negotiate credit line with bank

4. **Communication**
   - In-app banner: "We're experiencing high withdrawal volume. Your funds are safe. Processing may take 24-48 hours."
   - Email to all users
   - Social media statement

---

### 7.2 Data Breach

**Trigger:** Unauthorized access detected

**Response (First 30 Minutes):**
1. **Contain:** Isolate affected systems, block attacker IP
2. **Assess:** Determine what data was accessed
3. **Notify:** NITDA (within 72 hours), affected users

**Response (First 24 Hours):**
4. **Remediate:** Patch vulnerability, reset all user passwords
5. **Forensics:** Engage cybersecurity firm for investigation

**Response (First 7 Days):**
6. **Report:** Submit incident report to NITDA
7. **Improve:** Implement additional security measures

---

### 7.3 Fraud Wave

**Trigger:** 10+ fraud reports in 24 hours

**Response:**
1. **Pause New Registrations** (temporarily, 24-48 hours)
2. **Enhance KYC:** Require Tier 2 verification for all new users
3. **Review Agents:** Audit agents who verified flagged users
4. **System Scan:** Check for patterns (same device, IP, account numbers)
5. **Communication:** Notify users of enhanced security measures

---

## 8. Monthly Operations Checklist

### Week 1

**Finance:**
- [ ] Reconcile all accounts (daily throughout month)
- [ ] Process agent commission payouts (Friday)
- [ ] Review escrow aging report

**Customer Support:**
- [ ] Review Tier 2 ticket backlog
- [ ] Update FAQ based on common questions
- [ ] Agent WhatsApp group Q&A session

---

### Week 2

**Marketplace:**
- [ ] Review vendor performance scorecards
- [ ] Negotiate with underperforming vendors
- [ ] Onboard 2-3 new vendors

**Compliance:**
- [ ] File CBN monthly report (by 5th)
- [ ] Review SARs filed (if any)
- [ ] Audit 10 random KYC verifications

---

### Week 3

**Agent Network:**
- [ ] Conduct monthly training session (virtual)
- [ ] Recognize top 10 agents
- [ ] Send warning emails to <4.0 agents

**Product:**
- [ ] Release notes for mobile app update
- [ ] Monitor crash reports (Firebase, Sentry)

---

### Week 4

**Leadership:**
- [ ] All-hands meeting (review month's performance)
- [ ] Plan next month's OKRs
- [ ] Investor update email (if applicable)

**Marketing:**
- [ ] Publish monthly transparency report (blog)
- [ ] Social media campaign recap
- [ ] Plan next month's campaigns

---

## 📞 Operations Support

**For Financial Issues:**  
📧 finance@chaingive.ng  
📞 +234-XXX-XXXX (CFO direct line)

**For Vendor Issues:**  
📧 vendors@chaingive.ng

**For Agent Issues:**  
📧 agents@chaingive.ng  
📱 WhatsApp Group: [Link]

**For Compliance:**  
📧 compliance@chaingive.ng

---

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Next Review:** January 2026

*"Excellence is not a skill, it's an attitude." — Ralph Marston*
