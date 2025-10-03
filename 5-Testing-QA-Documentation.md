# 🧪 **ChainGive Testing & QA Documentation**

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Document Owner:** QA Team

---

## 📖 Table of Contents

1. [Testing Strategy](#1-testing-strategy)
2. [Test Cases for Core Flows](#2-test-cases-for-core-flows)
3. [Security Testing Checklist](#3-security-testing-checklist)
4. [Performance Benchmarks](#4-performance-benchmarks)
5. [Accessibility Audit Template](#5-accessibility-audit-template)
6. [Bug Report Template](#6-bug-report-template)
7. [Regression Testing](#7-regression-testing)
8. [User Acceptance Testing (UAT)](#8-user-acceptance-testing-uat)

---

## 1. Testing Strategy

### Testing Pyramid

```
         /\
        /  \
       / E2E\    ← 10% (End-to-End Tests)
      /______\
     /        \
    /Integration\ ← 30% (Integration Tests)
   /__________\
  /            \
 /  Unit Tests  \ ← 60% (Unit Tests)
/________________\
```

### Testing Levels

| Level | Tools | Coverage Target | Purpose |
|-------|-------|-----------------|---------|
| **Unit** | Jest | 80%+ | Test individual functions/components |
| **Integration** | Jest + Testing Library | 70%+ | Test feature interactions |
| **E2E** | Detox (mobile), Playwright (web) | Critical paths | Test full user journeys |
| **Manual** | Human testers | 100% (critical features) | Exploratory, UX testing |

### Test Environment

| Environment | Purpose | Data | URL |
|-------------|---------|------|-----|
| **Local** | Developer testing | Mock data | localhost:3000 |
| **Staging** | QA testing | Sanitized prod copy | staging.chaingive.ng |
| **Production** | Live users | Real data | chaingive.ng |

---

## 2. Test Cases for Core Flows

### 2.1 User Registration

**Test Case ID:** TC-REG-001  
**Priority:** Critical  
**Preconditions:** User not logged in

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Open app | Onboarding screen appears | ⬜ |
| 2 | Tap "Get Started" | Registration form displays | ⬜ |
| 3 | Enter phone: +2348012345678 | Phone number accepted | ⬜ |
| 4 | Enter email: test@example.com | Email accepted | ⬜ |
| 5 | Enter password: SecurePass123! | Password meets requirements | ⬜ |
| 6 | Enter first name: Adeyemi | Name accepted | ⬜ |
| 7 | Enter last name: Okonkwo | Name accepted | ⬜ |
| 8 | Tap "Sign Up" | OTP sent to phone, navigate to OTP screen | ⬜ |
| 9 | Enter OTP: 123456 | Account created, navigate to Home | ⬜ |
| 10 | Verify dashboard | User info displayed correctly | ⬜ |

**Edge Cases:**
- Invalid phone number (wrong format) → Error message
- Duplicate phone number → "Account already exists"
- Weak password → Validation error
- OTP timeout (5 minutes) → Resend option
- Network error during registration → Retry mechanism

---

### 2.2 Donation Cycle (Give Forward)

**Test Case ID:** TC-DON-001  
**Priority:** Critical  
**Preconditions:** User logged in, has ₦5,000 in wallet

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to "Give" tab | Give screen displays | ⬜ |
| 2 | View pending obligation | Shows ₦5,000 to give forward | ⬜ |
| 3 | Select "Let algorithm match me" | Preference selected | ⬜ |
| 4 | Tap "Confirm Donation" | Matching algorithm runs | ⬜ |
| 5 | View match result | Recipient info shown (name, location, trust score) | ⬜ |
| 6 | Tap "Proceed" | Transaction initiated | ⬜ |
| 7 | Enter wallet PIN | PIN verified | ⬜ |
| 8 | Confirm transaction | Donation sent, escrow holds funds | ⬜ |
| 9 | View transaction history | New "Sent" transaction appears | ⬜ |
| 10 | Wait for recipient confirmation | Notification when confirmed (within 48hrs) | ⬜ |
| 11 | Check Charity Coins | Coins credited based on speed | ⬜ |

**Edge Cases:**
- Insufficient balance → Error message with "Add Funds" option
- No available matches → "Check back later" message
- Recipient doesn't confirm (48hrs) → Auto-refund triggered
- Network error mid-transaction → Idempotency check prevents duplicate

---

### 2.3 Marketplace Redemption

**Test Case ID:** TC-MKT-001  
**Priority:** High  
**Preconditions:** User has 50+ Charity Coins

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to Marketplace | Listings display | ⬜ |
| 2 | View Charity Coin balance | Shows correct balance (e.g., 245 Coins) | ⬜ |
| 3 | Select "MTN Airtime ₦100" | Item details page opens | ⬜ |
| 4 | View item details | Price: 50 Coins, Rating: 4.8, In Stock | ⬜ |
| 5 | Tap "Redeem" | Confirmation modal appears | ⬜ |
| 6 | Confirm redemption | Processing indicator shows | ⬜ |
| 7 | Enter delivery phone number | Phone number validated | ⬜ |
| 8 | Complete redemption | Success message, Coins deducted | ⬜ |
| 9 | Check wallet | 245 → 195 Coins | ⬜ |
| 10 | Receive airtime | Airtime credited within 5 minutes | ⬜ |

**Edge Cases:**
- Insufficient Coins → "Need 50 Coins, you have 45" error
- Item out of stock → "Out of Stock" message, can't redeem
- Delivery failure → Auto-refund Charity Coins
- Invalid phone number → Validation error

---

### 2.4 Agent Verification

**Test Case ID:** TC-AGT-001  
**Priority:** High  
**Preconditions:** Agent logged in, user present with ID

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Agent opens dashboard | Agent mode enabled | ⬜ |
| 2 | Tap "Verify User" | User lookup screen appears | ⬜ |
| 3 | Enter user phone: +2348087654321 | User found, profile displays | ⬜ |
| 4 | Tap "Start Verification" | Camera opens for selfie + ID | ⬜ |
| 5 | Capture photo | Photo clear, ID readable | ⬜ |
| 6 | Review photo | Option to retake if needed | ⬜ |
| 7 | Upload utility bill (PDF) | File uploaded successfully | ⬜ |
| 8 | Tap "Submit Verification" | Submitted to HQ for review | ⬜ |
| 9 | Wait for approval (24hrs) | Agent receives notification | ⬜ |
| 10 | Check commission balance | ₦200 credited | ⬜ |

**Edge Cases:**
- Blurry photo → Warning message, suggest retake
- User not found → "Phone number not registered"
- Duplicate verification → "User already Tier 3"
- Network error during upload → Retry mechanism

---

## 3. Security Testing Checklist

### 3.1 Authentication & Authorization

- [ ] **Password Strength:** Min 8 chars, upper/lower/number/special enforced
- [ ] **Brute Force Protection:** Account locked after 5 failed login attempts (15 min cooldown)
- [ ] **Session Management:** JWT expires after 1 hour, refresh token after 30 days
- [ ] **Token Storage:** Tokens stored in secure storage (Keychain/Keystore), not AsyncStorage
- [ ] **Logout:** Token invalidated on server, removed from client
- [ ] **2FA:** SMS OTP required for sensitive actions (withdraw, change password)

### 3.2 Data Protection

- [ ] **Encryption in Transit:** TLS 1.3, certificate pinning on mobile
- [ ] **Encryption at Rest:** Database encrypted (AES-256), PII fields app-level encrypted
- [ ] **Input Validation:** All inputs sanitized (prevent SQL injection, XSS)
- [ ] **Output Encoding:** HTML entities encoded in web app
- [ ] **Sensitive Data Masking:** BVN/NIN masked (show last 4 digits only)

### 3.3 API Security

- [ ] **Rate Limiting:** 100 requests/15 min per IP
- [ ] **CORS:** Whitelist only chaingive.ng domains
- [ ] **SQL Injection:** Parameterized queries (ORM used)
- [ ] **API Versioning:** /v1/ prefix, backward compatibility
- [ ] **Error Messages:** No stack traces in production responses

### 3.4 Payment Security

- [ ] **PCI-DSS Compliance:** No card data stored (handled by Flutterwave/Paystack)
- [ ] **Transaction Limits:** Enforced per KYC tier
- [ ] **Escrow Protection:** 48-hour hold, idempotency keys prevent duplicates
- [ ] **Refund Process:** Tested for success and failure scenarios
- [ ] **Fraud Detection:** Auto-flag unusual patterns (tested with synthetic data)

### 3.5 Penetration Testing

**Annual Third-Party Audit:**
- [ ] OWASP Top 10 vulnerabilities checked
- [ ] Network scan for open ports
- [ ] Social engineering test (phishing simulation)
- [ ] Mobile app reverse engineering resistance

---

## 4. Performance Benchmarks

### 4.1 API Response Times

| Endpoint | Target | Max Acceptable | Actual | Status |
|----------|--------|----------------|--------|--------|
| GET /users/me | 100ms | 300ms | ___ ms | ⬜ |
| POST /auth/login | 200ms | 500ms | ___ ms | ⬜ |
| GET /wallet/balance | 100ms | 300ms | ___ ms | ⬜ |
| POST /donations/give | 500ms | 1000ms | ___ ms | ⬜ |
| GET /marketplace/listings | 150ms | 400ms | ___ ms | ⬜ |
| POST /wallet/withdraw | 500ms | 1000ms | ___ ms | ⬜ |

**Testing Tool:** Apache JMeter (1000 concurrent users)

### 4.2 Mobile App Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **App Size** | <15MB | ___ MB | ⬜ |
| **Cold Start Time** | <3s | ___ s | ⬜ |
| **Warm Start Time** | <1s | ___ s | ⬜ |
| **Memory Usage (Idle)** | <100MB | ___ MB | ⬜ |
| **Memory Usage (Active)** | <200MB | ___ MB | ⬜ |
| **CPU Usage (Avg)** | <20% | ___ % | ⬜ |
| **Frame Rate** | 60 FPS | ___ FPS | ⬜ |

**Testing Tool:** React Native Performance Monitor, Xcode Instruments

### 4.3 Database Performance

| Query | Target | Max Acceptable | Actual | Status |
|-------|--------|----------------|--------|--------|
| User lookup by phone | 10ms | 50ms | ___ ms | ⬜ |
| Transaction history (10 items) | 20ms | 100ms | ___ ms | ⬜ |
| Matching algorithm execution | 300ms | 800ms | ___ ms | ⬜ |
| Marketplace search | 50ms | 200ms | ___ ms | ⬜ |

**Testing Tool:** pgBench (PostgreSQL benchmark)

### 4.4 Load Testing

**Scenario:** Black Friday Marketplace Rush

- **Users:** 10,000 concurrent
- **Duration:** 30 minutes
- **Actions:** Browse listings, redeem items
- **Success Criteria:** 
  - Response time <1s (p95)
  - Error rate <1%
  - No database connection pool exhaustion

**Testing Tool:** k6, Grafana dashboard

---

## 5. Accessibility Audit Template

### WCAG 2.1 AA Compliance Checklist

#### 5.1 Perceivable

**Text Alternatives:**
- [ ] All images have alt text
- [ ] Decorative images marked with alt=""
- [ ] Icons paired with text labels (or aria-label)

**Color Contrast:**
- [ ] Text contrast ratio ≥4.5:1 (normal text)
- [ ] Text contrast ratio ≥3:1 (large text, 18pt+)
- [ ] UI components contrast ratio ≥3:1
- **Tool:** WebAIM Contrast Checker

**Adaptable Content:**
- [ ] App supports system font size (150%, 200%)
- [ ] No horizontal scrolling at 200% zoom
- [ ] Orientation works (portrait & landscape)

**Distinguishable:**
- [ ] Color not sole indicator (icons/text also used)
- [ ] Audio doesn't autoplay
- [ ] Focus indicators visible (2px outline)

#### 5.2 Operable

**Keyboard Accessible:**
- [ ] All interactive elements tabbable
- [ ] Tab order logical (top-left → bottom-right)
- [ ] No keyboard traps

**Enough Time:**
- [ ] OTP timeout extendable (user can request new OTP)
- [ ] No auto-refresh without warning

**Seizures:**
- [ ] No flashing content >3 times/second

**Navigable:**
- [ ] Page titles descriptive
- [ ] Skip links provided (web)
- [ ] Breadcrumbs on nested screens

**Input Modalities:**
- [ ] Touch targets ≥44×44px (iOS), ≥48×48px (Android)
- [ ] Motion-based actions have alternatives

#### 5.3 Understandable

**Readable:**
- [ ] Language declared (lang="en")
- [ ] Reading level ≤Grade 8 (Flesch-Kincaid)

**Predictable:**
- [ ] Navigation consistent across screens
- [ ] Forms don't auto-submit on focus change

**Input Assistance:**
- [ ] Error messages clear ("Email must include @")
- [ ] Suggestions provided ("Did you mean @gmail.com?")
- [ ] Confirmation required for financial transactions

#### 5.4 Robust

**Compatible:**
- [ ] Valid HTML/JSX (no unclosed tags)
- [ ] ARIA labels used correctly
- [ ] Tested with screen readers:
  - [ ] VoiceOver (iOS)
  - [ ] TalkBack (Android)
  - [ ] NVDA (Web)

### Accessibility Test Results

| Screen | WCAG Level | Issues Found | Status |
|--------|------------|--------------|--------|
| Login | AA | 0 | ✅ Pass |
| Registration | AA | 2 (contrast) | ⚠️ Fix |
| Home Dashboard | AA | 1 (alt text) | ⚠️ Fix |
| Marketplace | AA | 0 | ✅ Pass |

---

## 6. Bug Report Template

### Bug Report: [Short Description]

**Bug ID:** BUG-20251003-001  
**Reported By:** [Your Name]  
**Date:** October 3, 2025  
**Environment:** Staging (iOS 16.5, iPhone 12)

---

#### Severity

- [ ] **Critical** (App crashes, data loss, security breach)
- [x] **High** (Major feature broken, workaround exists)
- [ ] **Medium** (Minor feature broken)
- [ ] **Low** (Cosmetic, typo)

#### Priority

- [x] **P0** (Fix immediately)
- [ ] **P1** (Fix in current sprint)
- [ ] **P2** (Fix in next release)
- [ ] **P3** (Backlog)

---

#### Description

**Summary:**  
User unable to confirm donation receipt when offline, then reconnecting.

**Steps to Reproduce:**
1. Open app while connected to WiFi
2. Navigate to Home → Pending donation from "Emeka"
3. Turn on Airplane Mode
4. Tap "Confirm Receipt"
5. Turn off Airplane Mode (WiFi reconnects)
6. Observe result

**Expected Result:**  
Transaction queues while offline, then syncs when online. Success message appears.

**Actual Result:**  
Error message: "Network request failed." Transaction not queued.

**Frequency:**  
10/10 attempts

---

#### Environment

- **App Version:** 2.4.0 (build 142)
- **OS:** iOS 16.5
- **Device:** iPhone 12
- **Network:** WiFi → Offline → WiFi

---

#### Attachments

- Screenshot: `bug-001-error-message.png`
- Video: `bug-001-reproduction.mp4`
- Console logs: 
  ```
  [ERROR] axios.request failed: Network Error
  [ERROR] Transaction confirmation failed
  ```

---

#### Suggested Fix

Implement offline queue using redux-persist:
- Queue transaction when offline
- Retry when network detected
- Show "Queued for sync" message

---

#### Related Issues

- BUG-20250915-023 (similar offline issue in withdrawal flow)

---

## 7. Regression Testing

### Regression Test Suite

Run before each release to ensure no existing features broken.

#### Core Features (Must Pass)

| Test Case | Description | Last Passed | Status |
|-----------|-------------|-------------|--------|
| TC-REG-001 | User registration | 2025-09-30 | ⬜ |
| TC-AUTH-001 | User login | 2025-09-30 | ⬜ |
| TC-DON-001 | Give forward | 2025-09-30 | ⬜ |
| TC-DON-002 | Confirm receipt | 2025-09-30 | ⬜ |
| TC-WAL-001 | Deposit funds | 2025-09-30 | ⬜ |
| TC-WAL-002 | Withdraw funds | 2025-09-30 | ⬜ |
| TC-MKT-001 | Redeem Charity Coins | 2025-09-30 | ⬜ |
| TC-AGT-001 | Agent verification | 2025-09-30 | ⬜ |

#### Automated Regression (CI/CD)

**GitHub Actions Workflow:**
```yaml
name: Regression Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

**Coverage Target:** 80% (unit + integration)

---

## 8. User Acceptance Testing (UAT)

### UAT Process

**Participants:**
- 10 real users (diverse demographics)
- 2 Agents
- Product Manager (observer)

**Duration:** 3 days

**Environment:** Staging (with production-like data)

### UAT Test Scenarios

#### Scenario 1: First-Time User Journey

**Persona:** Fatima, 28, market trader in Lagos, smartphone novice

**Tasks:**
1. Download app, create account
2. Complete KYC via Agent
3. Receive first donation (simulated)
4. Give forward when ready
5. Earn Charity Coins
6. Redeem airtime in Marketplace

**Success Criteria:**
- [ ] Completes all tasks without assistance
- [ ] Time to complete: <30 minutes
- [ ] Satisfaction score: 4/5 or higher

#### Scenario 2: Power Partner Workflow

**Persona:** Emeka, 35, tech-savvy, completed 20 cycles

**Tasks:**
1. Give to 3 different recipients
2. Check leaderboard ranking
3. Refer a friend
4. Track impact dashboard
5. Participate in CSC Council vote (simulated)

**Success Criteria:**
- [ ] Completes all tasks
- [ ] No usability issues found
- [ ] Feature satisfaction: 4/5+

#### Scenario 3: Agent Onboarding

**Persona:** Ibrahim, 40, POS agent in Kano

**Tasks:**
1. Apply to become Agent
2. Complete training modules
3. Verify 3 users
4. Process cash deposit
5. Check commission earnings

**Success Criteria:**
- [ ] Training completion rate: 100%
- [ ] Quiz pass rate: 80%+
- [ ] Confidence to operate independently: Yes

### UAT Feedback Template

**Participant:** [Name]  
**Persona:** [Fatima/Emeka/Ibrahim]  
**Date:** [Date]

**Usability:**
- Ease of use: ⭐⭐⭐⭐⭐ (1-5)
- Clarity of instructions: ⭐⭐⭐⭐⭐
- Visual design: ⭐⭐⭐⭐⭐

**Bugs Found:**
1. [Description]
2. [Description]

**Suggestions:**
- [Feedback]

**Overall Satisfaction:** ⭐⭐⭐⭐⭐

---

## 📞 QA Support

**For Test Failures:**  
📧 qa@chaingive.ng

**Bug Reports:**  
🐛 Jira: https://chaingive.atlassian.net  
📧 bugs@chaingive.ng

---

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Next Review:** January 2026

*"Quality is not an act, it is a habit." — Aristotle*
