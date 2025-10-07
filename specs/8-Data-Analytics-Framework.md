# 📊 **ChainGive Data & Analytics Framework**

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Document Owner:** Data & Analytics Team

---

## 📖 Table of Contents

1. [Analytics Strategy](#1-analytics-strategy)
2. [Key Metrics Dashboard Specs](#2-key-metrics-dashboard-specs)
3. [Event Tracking Schema](#3-event-tracking-schema)
4. [Reporting Templates](#4-reporting-templates)
5. [Impact Measurement Methodology](#5-impact-measurement-methodology)
6. [A/B Testing Framework](#6-ab-testing-framework)
7. [Data Privacy & Ethics](#7-data-privacy--ethics)
8. [Tools & Infrastructure](#8-tools--infrastructure)

---

## 1. Analytics Strategy

### 1.1 Purpose

**Track:** User behavior, platform health, business metrics  
**Analyze:** Patterns, trends, anomalies  
**Optimize:** Product features, marketing campaigns, operations  
**Report:** Transparency to users, investors, regulators

---

### 1.2 Analytics Hierarchy

```
┌─────────────────────────────────────────┐
│         Strategic Metrics               │
│  (Board/Investor Level - Monthly)       │
│  - GMV, Active Users, Revenue           │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       Operational Metrics               │
│  (Leadership Level - Weekly)            │
│  - Cycle completion rate, Agent perf    │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Tactical Metrics                 │
│  (Team Level - Daily)                   │
│  - Signups, Transactions, Support tix   │
└─────────────────────────────────────────┘
```

---

### 1.3 Data Sources

| Source | Type | Frequency | Purpose |
|--------|------|-----------|---------|
| **PostgreSQL** | Transactional data | Real-time | Core metrics (users, transactions) |
| **Mixpanel** | Event tracking | Real-time | User behavior, funnel analysis |
| **Google Analytics** | Web traffic | Real-time | Website visits, conversions |
| **Firebase** | Mobile app analytics | Real-time | App usage, crashes |
| **Customer Support** | Tickets (Zendesk) | Daily | User pain points, feature requests |
| **Social Media** | Engagement | Daily | Brand sentiment, reach |

---

## 2. Key Metrics Dashboard Specs

### 2.1 Executive Dashboard (Weekly)

**Audience:** CEO, Board, Investors

#### **Top-Line Metrics**

| Metric | Definition | Target (Month 12) | Current |
|--------|------------|-------------------|---------|
| **Active Users** | Users who logged in last 30 days | 20,000 | ___ |
| **GMV** | Total donations processed (monthly) | ₦500M | ₦___ |
| **Revenue** | Transaction fees + Marketplace margin | ₦12M | ₦___ |
| **Cycle Completion Rate** | % of received donations paid forward | 85% | ___% |

**Visualizations:**
- Line chart: GMV over time (last 12 months)
- Bar chart: Active users by city (Lagos, Abuja, PH, Ibadan)
- Pie chart: Revenue breakdown (fees, marketplace, agents)

---

### 2.2 Product Dashboard (Daily)

**Audience:** Product Managers, Engineers

#### **User Acquisition**

| Metric | Formula | Target | Current |
|--------|---------|--------|---------|
| **New Signups** | COUNT(users WHERE created_at = TODAY) | 100/day | ___ |
| **Activation Rate** | % users who complete first cycle within 30 days | 60% | ___% |
| **Referral Rate** | % new users from referrals | 30% | ___% |

#### **User Engagement**

| Metric | Formula | Target | Current |
|--------|---------|--------|---------|
| **DAU (Daily Active Users)** | Unique users who opened app today | 5,000 | ___ |
| **MAU (Monthly Active Users)** | Unique users who opened app last 30 days | 20,000 | ___ |
| **Stickiness (DAU/MAU)** | Daily active / Monthly active | 25% | ___% |
| **Session Duration** | Avg time in app per session | 5 min | ___ min |

#### **Transaction Metrics**

| Metric | Formula | Target | Current |
|--------|---------|--------|---------|
| **Donations/Day** | COUNT(transactions WHERE type='donation_sent') | 200 | ___ |
| **Avg Donation Size** | AVG(amount) | ₦8,000 | ₦___ |
| **Transaction Success Rate** | % transactions completed / initiated | 95% | ___% |

**Visualizations:**
- Funnel chart: Registration → First donation → First cycle completed
- Heatmap: App usage by hour of day
- Cohort retention: % users active after Day 1, 7, 30, 90

---

### 2.3 Marketplace Dashboard (Weekly)

**Audience:** Marketplace Manager, Vendor Partners

| Metric | Target | Current |
|--------|--------|---------|
| **Listings** | 50 active listings | ___ |
| **Redemptions/Week** | 500 | ___ |
| **Avg Order Value (Coins)** | 75 Coins | ___ Coins |
| **Top Category** | Airtime (40% of redemptions) | ___ |
| **Vendor Rating (Avg)** | 4.7/5 | ___ |

**Visualizations:**
- Bar chart: Redemptions by category (Airtime, Data, Vouchers)
- Line chart: Marketplace GMV over time
- Table: Top 10 vendors by volume

---

### 2.4 Agent Dashboard (Monthly)

**Audience:** Agent Network Manager

| Metric | Target | Current |
|--------|--------|---------|
| **Active Agents** | 200 | ___ |
| **Verifications/Month** | 5,000 | ___ |
| **Cash Deposits/Month** | ₦50M | ₦___ |
| **Avg Agent Rating** | 4.5/5 | ___ |
| **Top Agent (Verifications)** | [Name], [City] | ___ |

**Visualizations:**
- Map: Agent locations (heat map)
- Histogram: Agent ratings distribution
- Leaderboard: Top 20 agents by commissions

---

## 3. Event Tracking Schema

### 3.1 User Events

**Tracked with Mixpanel**

#### **Authentication**

```javascript
// User Registration
mixpanel.track('User Registered', {
  user_id: 'uuid',
  phone_number: '+234XXXXXXXXXX',
  email: 'user@example.com',
  registration_source: 'organic' | 'referral' | 'agent',
  referrer_id: 'uuid' (if applicable),
  timestamp: '2025-10-03T10:30:00Z'
});

// User Login
mixpanel.track('User Logged In', {
  user_id: 'uuid',
  login_method: 'phone' | 'email',
  device_type: 'ios' | 'android' | 'web',
  timestamp: '2025-10-03T11:00:00Z'
});
```

#### **Donations**

```javascript
// Donation Initiated
mixpanel.track('Donation Initiated', {
  user_id: 'uuid',
  amount: 5000,
  recipient_id: 'uuid',
  recipient_preference: 'algorithm' | 'manual',
  timestamp: '2025-10-03T12:00:00Z'
});

// Donation Sent
mixpanel.track('Donation Sent', {
  user_id: 'uuid',
  transaction_id: 'uuid',
  amount: 5000,
  recipient_id: 'uuid',
  payment_method: 'wallet' | 'bank_transfer',
  timestamp: '2025-10-03T12:05:00Z'
});

// Donation Received (Confirmed)
mixpanel.track('Donation Received', {
  user_id: 'uuid',
  transaction_id: 'uuid',
  amount: 5000,
  donor_id: 'uuid',
  confirmation_time: '2025-10-03T14:00:00Z', // Time from send to confirm
  timestamp: '2025-10-03T14:00:00Z'
});

// Cycle Completed
mixpanel.track('Cycle Completed', {
  user_id: 'uuid',
  cycle_id: 'uuid',
  amount: 5000,
  days_to_complete: 14,
  charity_coins_earned: 50,
  timestamp: '2025-10-17T10:00:00Z'
});
```

#### **Marketplace**

```javascript
// Marketplace Viewed
mixpanel.track('Marketplace Viewed', {
  user_id: 'uuid',
  category_filter: 'all' | 'airtime' | 'data' | 'vouchers',
  timestamp: '2025-10-03T15:00:00Z'
});

// Item Viewed
mixpanel.track('Item Viewed', {
  user_id: 'uuid',
  listing_id: 'uuid',
  item_name: 'MTN Airtime ₦100',
  coin_price: 50,
  timestamp: '2025-10-03T15:05:00Z'
});

// Redemption Completed
mixpanel.track('Redemption Completed', {
  user_id: 'uuid',
  listing_id: 'uuid',
  item_name: 'MTN Airtime ₦100',
  coins_spent: 50,
  delivery_method: 'instant' | 'manual',
  timestamp: '2025-10-03T15:10:00Z'
});
```

#### **Agent**

```javascript
// User Verified by Agent
mixpanel.track('User Verified', {
  agent_id: 'uuid',
  user_id: 'uuid',
  verification_type: 'tier_3',
  documents_submitted: ['selfie', 'id', 'utility_bill'],
  timestamp: '2025-10-03T16:00:00Z'
});

// Cash Deposit Processed
mixpanel.track('Cash Deposit Processed', {
  agent_id: 'uuid',
  user_id: 'uuid',
  amount: 5000,
  commission: 100,
  timestamp: '2025-10-03T16:30:00Z'
});
```

---

### 3.2 System Events

```javascript
// Transaction Failed
mixpanel.track('Transaction Failed', {
  user_id: 'uuid',
  transaction_id: 'uuid',
  error_code: 'INSUFFICIENT_BALANCE',
  error_message: 'Wallet balance insufficient',
  timestamp: '2025-10-03T17:00:00Z'
});

// App Crashed
firebase.analytics().logEvent('app_crash', {
  user_id: 'uuid',
  device_type: 'ios' | 'android',
  os_version: '16.5',
  app_version: '2.4.0',
  crash_stack_trace: '...',
  timestamp: '2025-10-03T18:00:00Z'
});
```

---

## 4. Reporting Templates

### 4.1 Monthly Business Review (MBR)

**Audience:** Leadership Team  
**Format:** PowerPoint (15 slides max)

**Slide Structure:**

1. **Executive Summary**
   - Key metrics: Users, GMV, Revenue
   - Month-over-month growth %
   - Major wins & challenges

2. **User Growth**
   - Chart: New signups (daily trend)
   - Chart: MAU vs target
   - Cohort retention heatmap

3. **Transaction Health**
   - Chart: Donations processed (weekly)
   - Chart: Cycle completion rate
   - Table: Top 5 default reasons

4. **Marketplace Performance**
   - Chart: Redemptions by category
   - Table: Top 5 vendors
   - User feedback highlights

5. **Agent Network**
   - Map: Agent distribution
   - Chart: Verifications trend
   - Top agent spotlight

6. **Revenue & Unit Economics**
   - Chart: Revenue breakdown
   - Table: CAC vs LTV
   - Cash flow summary

7. **Product Updates**
   - Features launched this month
   - Bug fixes & improvements
   - Next month roadmap

8. **Customer Insights**
   - NPS score (Net Promoter Score)
   - Top support tickets
   - User testimonials

9. **Risks & Mitigation**
   - Operational risks (cash flow, fraud)
   - Mitigation actions

10. **Next Month Goals**
    - OKRs (Objectives & Key Results)

---

### 4.2 Quarterly Transparency Report (Public)

**Audience:** Users, CSC Council, Public  
**Format:** PDF + Blog post  
**Published:** 15th of Jan, Apr, Jul, Oct

**Report Structure:**

**1. Message from the Founder**

> "Dear ChainGive Community,
> 
> This quarter, 10,000 of you gave and received ₦200M. That's ₦200M in kindness, not debt.
> 
> Here's what happened behind the scenes..."

**2. Platform Stats**

| Metric | Q3 2025 | Q2 2025 | Growth |
|--------|---------|---------|--------|
| Active Users | 50,000 | 35,000 | +43% |
| Donations Processed | 15,000 | 10,000 | +50% |
| GMV | ₦600M | ₦400M | +50% |
| Avg Cycle Time | 21 days | 24 days | -12% ✅ |
| Charity Coins Earned | 750,000 | 500,000 | +50% |

**3. Impact Stories**

- **Fatima's Story:** How ChainGive helped her pay school fees
- **Emeka's Story:** From receiver to Power Partner
- **Agent Spotlight:** Ibrahim's impact in Kano market

**4. Financial Transparency**

| Category | Amount (₦) |
|----------|-----------|
| **Revenue** | ₦15M |
| Transaction fees | ₦12M |
| Marketplace margin | ₦2.5M |
| Agent network | ₦500k |
| **Expenses** | ₦12M |
| Salaries | ₦5M |
| Infrastructure | ₦2M |
| Marketing | ₦3M |
| Operations | ₦2M |
| **Net Profit** | **₦3M** |

**5. Trust & Safety**

- Fraud cases detected: 12
- Fraud cases resolved: 12 (100%)
- Account suspensions: 8 (all appealed, 3 reinstated)
- Disputes handled: 45 (85% resolved internally)

**6. CSC Council Update**

- Elections held: September 2025
- Council members: [9 names]
- Cases reviewed: 10
- Policy changes proposed: 2 (1 approved)

**7. What's Next**

- Launch in Ghana (Q4 2025)
- New marketplace partners (Jumia, Konga)
- CSC Council voting on mobile app

**8. Thank You**

> "To every giver, receiver, agent, and partner—thank you for building this with us.
> 
> Together, we're proving trust beats credit scores.
> 
> Onward,
> [Founder Name]"

---

### 4.3 Investor Update (Monthly Email)

**Audience:** Seed investors, board members

**Subject:** ChainGive Investor Update – October 2025

---

**Hi [Investor Name],**

Here's what happened in October:

**📈 Key Metrics**

| Metric | Oct | Sep | MoM Growth |
|--------|-----|-----|------------|
| MAU | 55,000 | 50,000 | +10% |
| GMV | ₦650M | ₦600M | +8% |
| Revenue | ₦16M | ₦15M | +7% |
| Burn Rate | ₦10M | ₦12M | -17% ✅ |

**🎉 Wins**

- **Ghana Pilot:** Signed MOU with Ghana Ministry of Finance
- **Partnership:** MTN now official marketplace partner (20M users)
- **Press:** Featured in CNN Africa ("The Startup Ending Loan Shark Abuse")

**⚠️ Challenges**

- **Fraud spike:** 20 cases (up from 12 last month). Implemented stricter KYC.
- **Agent churn:** 15% (target <10%). Launching retention program.

**💰 Fundraising**

- **Series A:** Targeting $2M (Q1 2026)
- **Lead interest:** [VC Name] (term sheet expected Dec)

**📅 Next Month**

- Launch CSC Council elections
- Black Friday marketplace campaign (target: 5,000 redemptions)

**Ask:** Intros to edtech partners (for school fees vouchers)?

Best,
[Founder Name]

---

## 5. Impact Measurement Methodology

### 5.1 Impact Framework

**What We Measure:**

1. **Financial Impact**
   - Amount of money circulated (GMV)
   - Interest saved (vs loan sharks)
   - Charity Coins redeemed (real value)

2. **Social Impact**
   - Lives touched (recipients)
   - Community trust built (trust scores)
   - Agent livelihoods created (commissions)

3. **Behavioral Impact**
   - Cycle completion rate (accountability)
   - Time to give forward (urgency)
   - Referral rate (advocacy)

---

### 5.2 Impact Calculation Examples

**Example 1: Interest Saved**

```
Assumption: Without ChainGive, user would borrow ₦5,000 from loan shark at 20%/month

ChainGive User:
- Receives ₦5,000 (donation)
- Gives forward ₦5,000 (no interest)
- Total cost: ₦0

Loan Shark:
- Borrows ₦5,000
- Repays ₦6,000 (after 1 month)
- Total cost: ₦1,000 (interest)

Impact per User: ₦1,000 saved
Impact (10,000 users): ₦10M saved collectively
```

**Example 2: Agent Livelihood**

```
Agent: Ibrahim (Kano)
- Verifications/month: 50 × ₦200 = ₦10,000
- Cash deposits: ₦500,000 × 2% = ₦10,000
- Total income: ₦20,000/month

Impact: Increased household income by 25% (prev: ₦80k/month)
```

---

### 5.3 Impact Report Template (Annual)

**Published:** January (for previous year)

**Title:** ChainGive 2025 Impact Report: ₦2B in Kindness, Not Debt

**Sections:**

1. **By the Numbers**
   - 100,000 users
   - ₦2B circulated
   - 50,000 cycles completed
   - ₦200M interest saved (vs loan sharks)

2. **Stories of Impact**
   - 10 user stories (video + text)
   - 5 agent stories
   - 1 CSC Council member

3. **Geographic Reach**
   - Map: Users across 10 Nigerian states

4. **What's Next**
   - 2026 goals: 500k users, expand to Ghana/Kenya

---

## 6. A/B Testing Framework

### 6.1 Test Hypothesis Template

**Feature:** Referral bonus amount

**Hypothesis:**  
Increasing referral bonus from 25 Coins → 50 Coins will increase referral rate from 30% → 40%.

**Metric:** Referral rate (% new users from referrals)

**Test Groups:**
- **Control (A):** 25 Coins (50% of users)
- **Variant (B):** 50 Coins (50% of users)

**Duration:** 2 weeks

**Success Criteria:** Referral rate >35% AND cost per acquisition <₦3,000

---

### 6.2 Test Results Template

**Test:** Referral Bonus (25 Coins vs 50 Coins)

**Results:**

| Group | Referrals | Referral Rate | CPA (Cost Per Acquisition) |
|-------|-----------|---------------|----------------------------|
| A (25 Coins) | 300 | 30% | ₦2,500 |
| B (50 Coins) | 450 | 38% | ₦3,200 |

**Winner:** B (50 Coins) – Higher referral rate ✅  
**Concern:** CPA slightly above target ❌

**Decision:** Launch 50 Coins, but monitor CPA. If CPA >₦3,500 for 2 consecutive months, revert to 25 Coins.

---

## 7. Data Privacy & Ethics

### 7.1 Data Anonymization

**For Public Reports:**
- Remove PII (names, phone numbers, emails)
- Aggregate data (city-level, not individual)
- Show trends, not individual transactions

**For Research:**
- Hash user IDs
- Request user consent
- IRB approval (if academic partnership)

---

### 7.2 Ethical Data Use

**We Will:**
- Use data to improve product
- Share aggregated insights publicly
- Protect user privacy (NDPR compliance)

**We Will NOT:**
- Sell user data
- Share PII with third parties (without consent)
- Use data to discriminate (e.g., deny service based on location)

---

## 8. Tools & Infrastructure

### 8.1 Analytics Stack

| Tool | Purpose | Cost |
|------|---------|------|
| **Mixpanel** | Event tracking, funnels | $999/month |
| **Google Analytics** | Web traffic | Free |
| **Firebase** | Mobile analytics, crashes | Free |
| **Metabase** | Internal dashboards (SQL queries) | Free (self-hosted) |
| **Looker** | Advanced BI (future) | $5k/month |

---

### 8.2 Data Warehouse

**Technology:** PostgreSQL (primary database) + Data warehouse (future: Snowflake/BigQuery)

**Schema:**
- `dim_users`: User dimension (id, name, tier, location)
- `dim_agents`: Agent dimension
- `fact_transactions`: Transaction fact table
- `fact_cycles`: Cycle completion fact table

---

## 📞 Analytics Support

**For Dashboard Access:**  
📧 analytics@chaingive.ng

**For Custom Reports:**  
📧 data@chaingive.ng

---

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Next Review:** January 2026

*"In God we trust. All others must bring data." — W. Edwards Deming*
