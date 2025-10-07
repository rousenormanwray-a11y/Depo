# 🚨 **ChainGive Crisis Management Plan**

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Document Owner:** Operations & Leadership Team

---

## 📖 Table of Contents

1. [Crisis Classification](#1-crisis-classification)
2. [Crisis Response Team](#2-crisis-response-team)
3. [Bank Run Scenario Response](#3-bank-run-scenario-response)
4. [Data Breach Protocol](#4-data-breach-protocol)
5. [Fraud Wave Containment](#5-fraud-wave-containment)
6. [PR Crisis Communication Templates](#6-pr-crisis-communication-templates)
7. [Regulatory Investigation Response](#7-regulatory-investigation-response)
8. [Platform Downtime](#8-platform-downtime)
9. [Agent Network Collapse](#9-agent-network-collapse)
10. [Post-Crisis Review](#10-post-crisis-review)

---

## 1. Crisis Classification

### Severity Levels

| Level | Definition | Examples | Response Time |
|-------|------------|----------|---------------|
| **P0 - Critical** | Existential threat to business | Bank run, major data breach, CBN suspension | <15 minutes |
| **P1 - High** | Significant operational impact | Payment processor down, fraud wave | <1 hour |
| **P2 - Medium** | Moderate disruption | API downtime, vendor dispute | <4 hours |
| **P3 - Low** | Minor inconvenience | UI bug, social media complaint | <24 hours |

---

### Crisis Categories

**1. Financial Crises**
- Bank run (mass withdrawals)
- Payment processor failure
- Escrow fund misappropriation

**2. Security Crises**
- Data breach (user PII exposed)
- Account takeover wave
- Insider fraud

**3. Operational Crises**
- Platform downtime (>4 hours)
- Database corruption
- Third-party service failure

**4. Reputational Crises**
- Negative media coverage ("ChainGive is a Ponzi!")
- User backlash (social media storm)
- Celebrity/influencer attack

**5. Regulatory Crises**
- CBN investigation
- NDPR violation notice
- Legal action (lawsuit)

---

## 2. Crisis Response Team

### Roles & Responsibilities

| Role | Responsibilities | Contact |
|------|-----------------|---------|
| **Incident Commander (CEO)** | Overall crisis leadership, final decisions | +234-XXX-XXXX |
| **Finance Lead (CFO)** | Liquidity management, bank relations | +234-XXX-XXXX |
| **Tech Lead (CTO)** | System security, downtime recovery | +234-XXX-XXXX |
| **Communications Lead (CMO)** | PR, user messaging, media relations | +234-XXX-XXXX |
| **Legal Lead (General Counsel)** | Regulatory compliance, legal strategy | +234-XXX-XXXX |
| **Operations Lead (COO)** | Agent network, customer support | +234-XXX-XXXX |

---

### Crisis War Room

**Physical Location:** ChainGive HQ, Lagos  
**Virtual:** Zoom link (always-on during crisis)  
**Duration:** Until crisis resolved + 24 hours

**Required Materials:**
- [ ] Crisis playbook (this document)
- [ ] Emergency contact list (all stakeholders)
- [ ] Pre-approved PR templates
- [ ] Legal counsel on standby

---

## 3. Bank Run Scenario Response

### 3.1 Trigger Event

**Definition:** >20% of total wallet balances requested for withdrawal in <24 hours

**Example:**
- Total user balances: ₦500M
- Withdrawal requests: ₦100M+ in one day

---

### 3.2 Response Protocol (First Hour)

#### **Step 1: Assess Liquidity (0-15 min)**

**Finance Lead Actions:**
```
1. Check bank balance (Flutterwave, Paystack, Opay accounts)
2. Calculate:
   - Total liabilities (user wallets + escrow)
   - Available cash (bank balance)
   - Shortfall (if any)
3. Report to Incident Commander
```

**Decision Matrix:**

| Scenario | Shortfall | Action |
|----------|-----------|--------|
| **Green** | 0-10% | Standard processing, monitor closely |
| **Yellow** | 10-30% | Implement controls (see Step 2) |
| **Red** | >30% | Emergency fundraising (see Step 3) |

---

#### **Step 2: Implement Controls (15-30 min)**

**If Yellow or Red:**

**Immediate Controls:**
- [ ] Reduce daily withdrawal limit:  
  - Tier 1: ₦50k → ₦20k  
  - Tier 2: ₦200k → ₦50k  
  - Tier 3: ₦1M → ₦100k
- [ ] Extend withdrawal processing time:  
  - Instant → 24 hours (Yellow)  
  - Instant → 72 hours (Red)
- [ ] Pause new deposits (prevent bad actors from depositing, then withdrawing)
- [ ] Enable manual approval for withdrawals >₦50k

**Communication (In-App Banner):**
```
⚠️ Important Notice

We're experiencing high withdrawal volume. Your funds are 100% safe and secured in our bank accounts.

To ensure fairness, we've temporarily extended processing times to 24-72 hours.

Thank you for your patience. We're here to help: support@chaingive.ng
```

**Email to All Users:**
```
Subject: Important Update: Withdrawal Processing Times

Dear [User Name],

We're writing to inform you of a temporary change to withdrawal processing.

What's Happening:
Due to unusually high withdrawal requests, we've extended processing times to ensure all users are served fairly.

Your Funds Are Safe:
- 100% of user funds are in CBN-regulated bank accounts
- We maintain 15% reserve (above CBN requirement)
- You can view our bank statements here: [Link]

New Processing Times:
- Withdrawals processed within 24-72 hours (was instant)
- You'll receive email confirmation when completed

Why This Matters:
ChainGive is built on trust. We'll never sacrifice your safety for speed.

Questions? Reply to this email or WhatsApp: +234-XXX-XXXX

Thank you for your understanding.

Best,
[CEO Name]
Founder & CEO, ChainGive
```

---

#### **Step 3: Secure Additional Funds (30-60 min)**

**If Red:**

**Option 1: Emergency Credit Line**
- Contact: First Bank of Nigeria (pre-approved ₦100M line)
- Process: Sign loan agreement, funds available same day
- Cost: 12% annual interest

**Option 2: Investor Bridge Loan**
- Contact: [Investor Name] (pre-committed $100k = ₦120M)
- Process: Email request, funds within 24 hours
- Terms: Convertible note (to be repaid or converted to equity)

**Option 3: Liquidate Reserves**
- Sell Charity Coin reserve inventory (airtime, data vouchers)
- Expected value: ₦50M
- Process: Contact vendors for buyback (24-48 hours)

---

### 3.3 Response Protocol (First 24 Hours)

#### **Step 4: Root Cause Analysis (Hour 2-4)**

**Questions to Answer:**
1. **What triggered this?**
   - Negative news/rumor?
   - Competitor attack?
   - Organic user concern?

2. **Who is withdrawing?**
   - New users (<30 days)?
   - High-value users (>₦100k balances)?
   - Specific geographic area?

3. **Is this coordinated?**
   - Check for social media campaigns (#BoycottChainGive?)
   - Telegram/WhatsApp groups organizing withdrawals?

**Data Analysis:**
```sql
-- Identify withdrawal patterns
SELECT 
  user_id,
  location_city,
  created_at AS user_since,
  SUM(amount) AS total_withdrawn
FROM transactions
WHERE type = 'withdrawal'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, location_city, created_at
ORDER BY total_withdrawn DESC
LIMIT 100;
```

---

#### **Step 5: Counter-Messaging (Hour 4-12)**

**If Rumor/Misinformation:**

**Social Media Response (Twitter, Facebook, Instagram):**
```
📢 Setting the Record Straight

We've seen false rumors that ChainGive is "running out of money." Here are the facts:

✅ 100% of user funds are in CBN-regulated banks
✅ We maintain 15% cash reserves (₦75M+)
✅ Zero debt, zero pending lawsuits
✅ Audited financial statements: [Link]

Withdrawals are delayed due to HIGH VOLUME, not insolvency. Every single user will be paid.

We're transparent because you deserve trust.

Questions? DM us or visit chaingive.ng/transparency
```

**Media Outreach:**
- Contact TechCabal, Techpoint, Nairametrics
- Offer exclusive interview with CEO
- Share bank statements (with bank's permission)

---

#### **Step 6: Community Reassurance (Hour 12-24)**

**CSC Council Meeting (Emergency Session):**
- Brief council on situation
- Show financial evidence
- Ask council to vouch publicly (if willing)

**Power Partner Webinar:**
- Invite top 100 users (Power Partners)
- CEO Q&A session
- Offer "VIP processing" for their withdrawals (goodwill gesture)

**Agent Network:**
- WhatsApp broadcast to all agents
- Ask agents to reassure users in person
- Bonus: ₦500 for every user they calm down (verified via support tickets)

---

### 3.4 Post-Crisis (Week 1-4)

**Week 1:**
- [ ] Restore normal withdrawal limits/processing times
- [ ] Repay emergency credit line (if used)
- [ ] Publish transparency report: "What Happened & What We Learned"

**Week 2-4:**
- [ ] Increase cash reserves (15% → 20%)
- [ ] Implement early warning system (alert if withdrawals >10% in 6 hours)
- [ ] Conduct user survey: "What would make you trust us more?"

---

## 4. Data Breach Protocol

### 4.1 Trigger Event

**Definition:** Unauthorized access to user data (PII, financial info, credentials)

**Examples:**
- Database compromised
- AWS S3 bucket exposed
- Employee laptop stolen with user data

---

### 4.2 Response Protocol (First 30 Minutes)

#### **Step 1: Contain (0-5 min)**

**Tech Lead Actions:**
```
1. Isolate affected systems (disconnect from internet)
2. Block attacker IP addresses
3. Revoke all admin access tokens
4. Enable read-only mode on database (prevent further changes)
```

**Incident Commander Actions:**
```
1. Activate Crisis Response Team (page all members)
2. Notify Legal Lead (for regulatory reporting)
3. Engage cybersecurity firm (pre-contracted: [Firm Name])
```

---

#### **Step 2: Assess Scope (5-30 min)**

**Questions to Answer:**

1. **What data was accessed?**
   - [ ] User names
   - [ ] Phone numbers
   - [ ] Email addresses
   - [ ] BVN/NIN
   - [ ] Transaction history
   - [ ] Passwords (hashed or plain text?)

2. **How many users affected?**
   - All users? Subset?

3. **How did attacker gain access?**
   - SQL injection?
   - Stolen credentials?
   - Insider threat?

4. **Is attacker still in system?**
   - Check active sessions
   - Review recent database queries

**Severity Classification:**

| Data Exposed | Severity | Notification Required |
|--------------|----------|-----------------------|
| Names, emails only | P2 - Medium | Users + NITDA (72 hours) |
| Phone numbers + transaction history | P1 - High | Users + NITDA (72 hours) + Media |
| BVN/NIN + passwords | P0 - Critical | Users + NITDA (24 hours) + CBN + Media |

---

### 4.3 Response Protocol (First 24 Hours)

#### **Step 3: Remediate (Hour 1-4)**

**Immediate Actions:**
- [ ] Patch vulnerability (if SQL injection, etc.)
- [ ] Force password reset for all users
- [ ] Invalidate all active sessions (force re-login)
- [ ] Enable 2FA for all withdrawals (temporary emergency measure)
- [ ] Rotate all API keys and secrets

**Communication to Users (Email + SMS + In-App):**
```
Subject: URGENT: Security Incident – Action Required

Dear [User Name],

We're writing to inform you of a security incident that may have affected your account.

What Happened:
On [Date], we detected unauthorized access to our systems. We immediately isolated the issue and engaged cybersecurity experts.

What Data Was Affected:
- Your name, phone number, and email address
- [Add other data types if applicable]

What We're Doing:
✅ Patched the vulnerability
✅ Engaged cybersecurity firm for full audit
✅ Notified NITDA (data protection regulator)

What You Should Do:
1. RESET YOUR PASSWORD immediately: [Link]
2. Enable 2FA (two-factor authentication): [Link]
3. Monitor your bank accounts for unusual activity
4. Report suspicious activity: security@chaingive.ng

We're Offering:
- Free identity theft monitoring (1 year) via [Partner]
- Dedicated support line: +234-XXX-XXXX

We take full responsibility and are committed to earning back your trust.

Sincerely,
[CEO Name]
Founder & CEO, ChainGive
```

---

#### **Step 4: Notify Authorities (Hour 4-24)**

**NITDA Notification (Within 72 hours per NDPR):**
```
To: info@nitda.gov.ng
Subject: Data Breach Notification – ChainGive Technologies Ltd

Dear NITDA,

This is to formally notify you of a data breach incident at ChainGive Technologies Limited.

Incident Details:
- Date/Time Detected: [Date/Time]
- Nature of Breach: Unauthorized access via [method]
- Data Affected: Names, phone numbers, emails of [X] users
- Cause: [SQL injection / stolen credentials / etc.]

Actions Taken:
- Contained within 30 minutes
- Engaged [Cybersecurity Firm Name]
- Notified affected users within 24 hours
- Implemented additional security measures

We are cooperating fully and available for any inquiries.

Contact: [DPO Name], dpo@chaingive.ng, +234-XXX-XXXX

Sincerely,
[CEO Name]
```

**CBN Notification (If financial data exposed):**
```
To: contactcentre@cbn.gov.ng
Subject: Security Incident Notification – ChainGive (PSP License #XXXX)

[Similar format as NITDA notification]
```

---

#### **Step 5: Forensics & Investigation (Hour 24+)**

**Cybersecurity Firm Engagement:**
- Full system audit
- Identify attack vector
- Check for backdoors
- Preserve evidence (for potential legal action)

**Internal Investigation:**
- Review employee access logs (insider threat?)
- Interview IT team
- Check vendor security (third-party breach?)

**Timeline:** 7-14 days

---

### 4.4 Post-Crisis (Week 1-4)

**Week 1:**
- [ ] Publish incident report (public blog post)
- [ ] Conduct all-hands meeting (reassure employees)
- [ ] Engage PR firm (reputation management)

**Week 2-4:**
- [ ] Implement additional security measures (SOC2 compliance)
- [ ] Conduct third-party penetration test
- [ ] Offer bounty program: ₦500k for critical vulnerabilities

**Month 3:**
- [ ] Annual security audit
- [ ] ISO 27001 certification (information security)

---

## 5. Fraud Wave Containment

### 5.1 Trigger Event

**Definition:** 10+ fraud reports in 24 hours OR 5+ fraud cases from same agent/city

**Examples:**
- Multiple fake accounts created
- Collusion between agents and users
- Payment proof forgery

---

### 5.2 Response Protocol (First Hour)

#### **Step 1: Identify Pattern (0-15 min)**

**Data Analysis:**
```sql
-- Fraud reports (last 24 hours)
SELECT 
  user_id,
  report_reason,
  location_city,
  verified_by_agent_id,
  created_at
FROM fraud_reports
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Questions:**
- Same agent verified all flagged users?
- Same IP address used for multiple accounts?
- Same device ID?
- Same bank account receiving funds?

---

#### **Step 2: Immediate Containment (15-30 min)**

**Actions:**
- [ ] **Suspend flagged users** (freeze wallets, no withdrawals)
- [ ] **Suspend implicated agents** (pending investigation)
- [ ] **Pause new registrations** (24-48 hours, if widespread)
- [ ] **Enable enhanced KYC**:
  - All new users require Tier 2 verification (BVN/NIN)
  - All donations >₦10k require manual approval

---

#### **Step 3: Notify Stakeholders (30-60 min)**

**Internal:**
- Alert Compliance Team
- Brief CSC Council (if agent involved)

**External (If >50 cases):**
- Email to all users: "We've detected fraudulent activity. Here's what we're doing..."
- NFIU notification (if money laundering suspected)

---

### 5.3 Investigation (Hour 2-24)

**Compliance Team Actions:**

**For Each Case:**
1. Review account creation details (IP, device, time)
2. Check transaction history (unusual patterns?)
3. Contact user for verification (video call)
4. Review agent verification records (photo quality, documentation)

**Decision Matrix:**

| Finding | Action |
|---------|--------|
| **Confirmed Fraud** | Permanent ban, refund victims, report to NFIU (if >₦100k) |
| **Agent Negligence** | Suspend agent (30-90 days), retraining required |
| **User Mistake** | Warning, educational resources, reinstate account |
| **Unclear** | Escalate to CSC Council for review |

---

### 5.4 System Improvements (Week 1-4)

**Week 1:**
- [ ] Add device fingerprinting (prevent multi-account)
- [ ] Implement liveness detection (selfie verification)
- [ ] Require video call for Tier 3 verification (high-value users)

**Week 2-4:**
- [ ] Agent audit: Review all verifications from last 90 days
- [ ] Fraud detection ML model (flag suspicious patterns automatically)

---

## 6. PR Crisis Communication Templates

### 6.1 Negative Media Article

**Scenario:** TechCabal publishes: "Is ChainGive a Ponzi Scheme? Users Complain"

**Response (Within 2 Hours):**

**Twitter Thread:**
```
1/7 We've seen @TechCabal's article. We respect journalism, but we want to set the record straight. 🧵

2/7 ChainGive is NOT a Ponzi scheme. Here's why:
- We don't promise returns
- We don't pay old users with new user money
- We're 100% transparent (all transactions on blockchain)

3/7 What we ARE:
- A mutual aid platform
- No interest, no debt
- You give forward, not back
- Regulated by CBN (PSP License #XXXX)

4/7 The complaints in the article:
- 3 users unhappy with trust score calculations
- We're investigating & will make it right

5/7 Our track record:
- 50,000 users
- ₦2B circulated
- 85% cycle completion rate
- Zero defaults requiring legal action

6/7 We invite @TechCabal to:
- Review our financial statements
- Interview our CSC Council (user-elected)
- Visit our HQ (anytime)

7/7 To our users: We're not perfect, but we're honest. Questions? Reply or DM. We're here.
```

**Email to TechCabal Editor:**
```
Subject: Re: "Is ChainGive a Ponzi Scheme?" – Request for Correction

Dear [Editor Name],

We appreciate TechCabal's coverage, but we'd like to clarify some inaccuracies in today's article.

Corrections Requested:

1. "ChainGive promises returns" → FALSE
   We explicitly state in our ToS: "No returns promised."

2. "Users can't withdraw" → MISLEADING
   We processed 10,000 withdrawals last month (avg time: 4 hours).
   The 3 cases in your article involved KYC verification delays, not withdrawal blocks.

Supporting Evidence:
- CBN PSP License: [Attachment]
- Bank statements: [Link]
- User testimonials: [Link]

We'd welcome the chance to discuss this in detail. Can we schedule a call?

Best,
[CMO Name]
Head of Communications, ChainGive
```

---

### 6.2 Social Media Storm

**Scenario:** Hashtag #ChainGiveScam trends on Twitter

**Response:**

**CEO Video Statement (Record & Post Within 1 Hour):**
```
Script:

"Hi, I'm [CEO Name], founder of ChainGive.

I've seen #ChainGiveScam trending. I want to address this head-on.

[Pause, look directly at camera]

Here's the truth:

1. We are NOT a scam. We are a licensed Payment Service Provider, regulated by the Central Bank of Nigeria.

2. Every user's money is in CBN-regulated bank accounts. You can verify this with our bank: [Bank Name].

3. If you're having an issue—withdrawals, trust score, anything—email me personally: [ceo@chaingive.ng]. I will respond within 24 hours.

We're not perfect. We make mistakes. But we will NEVER scam you.

If you don't trust us, withdraw your money. No questions asked.

But if you believe in what we're building—a Nigeria where trust beats debt—stay with us.

Thank you."

[Post to Twitter, Instagram, LinkedIn, Facebook]
```

**Engage Top Critics:**
- DM top 10 users posting #ChainGiveScam
- Offer to resolve their issue personally
- If genuine grievance: Fix it + apologize publicly
- If troll/competitor: Disengage

---

## 7. Regulatory Investigation Response

### 7.1 Trigger Event

**CBN Sends Notice:** "Regulatory Compliance Audit – ChainGive Technologies Ltd"

---

### 7.2 Response Protocol (First 24 Hours)

#### **Step 1: Assemble Legal Team (Hour 0-2)**

**Team:**
- General Counsel (lead)
- External law firm ([Firm Name])
- Compliance Officer
- CFO (financial records)

**First Meeting:**
- Review notice (what are they investigating?)
- Assign document collection tasks
- Prepare response timeline

---

#### **Step 2: Document Collection (Hour 2-24)**

**CBN Typically Requests:**
- [ ] PSP license application & approval
- [ ] AML/KYC policies
- [ ] Transaction records (last 12 months)
- [ ] Bank statements
- [ ] Agent network audit trail
- [ ] Customer complaint resolution logs
- [ ] Organizational chart

**Deadline:** Usually 14 days

---

#### **Step 3: Internal Review (Day 1-7)**

**Before Submitting to CBN:**
- Legal team reviews all documents
- Identify any compliance gaps
- Prepare remediation plan (if needed)

---

#### **Step 4: Submission & Follow-Up (Day 7-14)**

**Submission:**
- Deliver documents (physical + digital)
- Include cover letter (cooperative tone)
- Assign point person for CBN questions

**Potential Outcomes:**

| Outcome | Probability | Action |
|---------|-------------|--------|
| **No Issues Found** | 60% | Celebrate, continue ops |
| **Minor Violations** | 30% | Fix, pay fine (₦500k-₦5M), continue ops |
| **Major Violations** | 9% | Remediation plan, probation (6 months) |
| **License Suspension** | 1% | Crisis mode (see below) |

---

### 7.3 If License Suspended

**Immediate Actions (Hour 0-4):**
- [ ] Freeze all new transactions
- [ ] Notify users (email, SMS, in-app)
- [ ] Enable withdrawal-only mode (return user funds)
- [ ] Engage top-tier law firm for appeal

**Communication to Users:**
```
Subject: Important: CBN License Suspension – Your Funds Are Safe

Dear [User Name],

We're writing to inform you that CBN has temporarily suspended our PSP license pending investigation.

What This Means:
- No new deposits or donations
- Withdrawals ONLY (your money is safe and accessible)

What We're Doing:
- Cooperating fully with CBN
- Appealing the suspension
- Working with [Law Firm Name] to resolve

Timeline:
- Suspension typically lasts 30-90 days
- We expect resolution by [Date]

Your Funds:
- 100% accessible for withdrawal (no restrictions)
- Withdraw now or wait for resolution (your choice)

We'll update you weekly. Thank you for your patience.

Best,
[CEO Name]
```

---

## 8. Platform Downtime

### 8.1 Trigger Event

**Definition:** API downtime >1 hour OR mobile app crashes affecting >10% of users

---

### 8.2 Response Protocol

**Step 1: Status Page (Minute 0-5)**
- Update status.chaingive.ng: "Investigating outage"
- Tweet: "We're aware of the issue and investigating."

**Step 2: Root Cause (Minute 5-30)**
- Check AWS health dashboard
- Review recent deploys
- Database connectivity test

**Step 3: Resolution (Minute 30-60)**
- Rollback recent deploy (if cause)
- Scale up servers (if traffic spike)
- Switch to backup database (if DB issue)

**Step 4: Post-Mortem (Day 1-3)**
- Publish incident report
- Implement preventive measures

---

## 9. Agent Network Collapse

### 9.1 Trigger Event

**Definition:** 50% of agents inactive for >7 days OR top 10 agents resign in same week

---

### 9.2 Response Protocol

**Step 1: Emergency Agent Town Hall (Day 1)**
- Virtual Zoom meeting (mandatory for all agents)
- CEO addresses concerns
- Q&A session
- Announce retention bonuses

**Step 2: Retention Program (Day 1-30)**
- **Bonus:** ₦5,000 for agents who stay active (30 days)
- **Support:** Dedicated WhatsApp hotline
- **Training:** Monthly webinars

**Step 3: Recruitment Blitz (Day 1-60)**
- Target: 100 new agents
- Referral bonus: ₦2,000 per successful recruit

---

## 10. Post-Crisis Review

### 10.1 Debrief Meeting (Within 7 Days)

**Agenda:**
1. Timeline of events (what happened, when)
2. What went well (wins)
3. What went wrong (failures)
4. Lessons learned
5. Action items (prevent recurrence)

**Attendees:** Crisis Response Team + relevant stakeholders

---

### 10.2 Public Report (Within 30 Days)

**Blog Post: "What Happened & What We Learned"**

**Sections:**
1. **What Happened:** Honest account of crisis
2. **Our Response:** Timeline of actions taken
3. **Impact:** How many users affected, financial impact
4. **Lessons Learned:** What we'll do differently
5. **Thank You:** Gratitude to users, team, partners

**Tone:** Humble, transparent, accountable

---

## 📞 Emergency Contacts

**Crisis Hotline (24/7):**  
📞 +234-XXX-XXXX (Incident Commander direct)

**For Media Inquiries:**  
📧 press@chaingive.ng  
📞 +234-XXX-XXXX (CMO direct)

**For Regulatory Matters:**  
📧 legal@chaingive.ng  
📞 +234-XXX-XXXX (General Counsel direct)

---

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Next Review:** January 2026

*"In the middle of difficulty lies opportunity." — Albert Einstein*
