# 🗺️ ChainGive Backend - Implementation Roadmap

**Current Completion:** 70%  
**Target:** Production-Ready MVP  
**Timeline:** 4 weeks (30 days)

---

## 📅 WEEK 1: Payment Integration & SMS (P0)

**Goal:** Enable money deposits/withdrawals and OTP delivery  
**Days:** 7 days

### Day 1-2: Flutterwave Integration

**Files to Create:**
```
src/services/payment/flutterwave.service.ts
src/controllers/payment.controller.ts
src/routes/payment.routes.ts
```

**Tasks:**
- [ ] Create Flutterwave service wrapper
- [ ] Implement deposit initiation
- [ ] Implement payment verification
- [ ] Add webhook handler for payment confirmation
- [ ] Update wallet controller to use Flutterwave
- [ ] Test with test API keys

**Code Template:**
```typescript
// src/services/payment/flutterwave.service.ts
import axios from 'axios';

const BASE_URL = 'https://api.flutterwave.com/v3';

export class FlutterwaveService {
  async initiatePayment(data: {
    amount: number;
    email: string;
    phone: string;
    txRef: string;
  }) {
    const response = await axios.post(
      `${BASE_URL}/payments`,
      {
        tx_ref: data.txRef,
        amount: data.amount,
        currency: 'NGN',
        redirect_url: process.env.FLUTTERWAVE_REDIRECT_URL,
        customer: {
          email: data.email,
          phonenumber: data.phone,
        },
        payment_options: 'card,banktransfer,ussd',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );
    
    return response.data;
  }

  async verifyPayment(txRef: string) {
    const response = await axios.get(
      `${BASE_URL}/transactions/verify_by_reference?tx_ref=${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );
    
    return response.data;
  }

  verifyWebhookSignature(signature: string, payload: any): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha256', process.env.FLUTTERWAVE_SECRET_HASH)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }
}
```

---

### Day 3-4: Paystack Integration

**Files to Create:**
```
src/services/payment/paystack.service.ts
```

**Tasks:**
- [ ] Create Paystack service wrapper
- [ ] Implement bank list fetching
- [ ] Implement account name resolution
- [ ] Implement transfer initiation
- [ ] Add webhook handler for transfer status
- [ ] Test withdrawals

**Code Template:**
```typescript
// src/services/payment/paystack.service.ts
import axios from 'axios';

const BASE_URL = 'https://api.paystack.co';

export class PaystackService {
  async getBankList() {
    const response = await axios.get(`${BASE_URL}/bank`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
    
    return response.data.data;
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    const response = await axios.get(
      `${BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    
    return response.data.data;
  }

  async createTransferRecipient(data: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  }) {
    const response = await axios.post(
      `${BASE_URL}/transferrecipient`,
      {
        type: 'nuban',
        name: data.accountName,
        account_number: data.accountNumber,
        bank_code: data.bankCode,
        currency: 'NGN',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    
    return response.data.data;
  }

  async initiateTransfer(recipientCode: string, amount: number, reference: string) {
    const response = await axios.post(
      `${BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient: recipientCode,
        reference,
        reason: `ChainGive withdrawal - ${reference}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    
    return response.data.data;
  }
}
```

---

### Day 5: Twilio SMS Integration

**Files to Update:**
```
src/services/otp.service.ts
```

**Tasks:**
- [ ] Install Twilio SDK: `npm install twilio`
- [ ] Add Twilio credentials to .env
- [ ] Update sendOTP function
- [ ] Test SMS delivery
- [ ] Add SMS delivery logging
- [ ] Handle SMS failures gracefully

**Code Update:**
```typescript
// src/services/otp.service.ts (update)
import twilio from 'twilio';
import logger from '../utils/logger';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOTP(phoneNumber: string): Promise<void> {
  const otp = generateOTP();
  await storeOTP(phoneNumber, otp);

  try {
    // Send SMS via Twilio
    await twilioClient.messages.create({
      body: `Your ChainGive verification code is: ${otp}. Valid for 5 minutes. Never share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    logger.info(`OTP sent to ${phoneNumber}`);
  } catch (error) {
    logger.error('Failed to send OTP via Twilio:', error);
    
    // Fallback: log to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`OTP for ${phoneNumber}: ${otp}`);
    }
    
    throw new Error('Failed to send OTP');
  }
}
```

---

### Day 6-7: Payment Webhooks & Testing

**Files to Create:**
```
src/routes/webhook.routes.ts
src/controllers/webhook.controller.ts
```

**Tasks:**
- [ ] Create webhook endpoints
- [ ] Handle Flutterwave webhooks
- [ ] Handle Paystack webhooks
- [ ] Verify webhook signatures
- [ ] Update transaction statuses
- [ ] Credit/debit wallets
- [ ] Send notifications
- [ ] Test end-to-end payment flow

**Code:**
```typescript
// src/controllers/webhook.controller.ts
export async function handleFlutterwaveWebhook(req: Request, res: Response) {
  const signature = req.headers['verif-hash'];
  
  if (!flutterwaveService.verifyWebhookSignature(signature, req.body)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, data } = req.body;

  if (event === 'charge.completed' && data.status === 'successful') {
    const txRef = data.tx_ref;
    
    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { transactionRef: txRef },
    });

    if (transaction && transaction.status === 'pending') {
      // Update transaction
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'completed',
            paymentProviderRef: data.flw_ref,
            completedAt: new Date(),
          },
        }),
        prisma.wallet.update({
          where: { userId: transaction.toUserId! },
          data: {
            fiatBalance: { increment: transaction.amount },
            totalInflows: { increment: transaction.amount },
          },
        }),
      ]);

      // Send notification
      await sendPushNotification(
        transaction.toUserId!,
        'Deposit Successful',
        `₦${transaction.amount} has been added to your wallet`
      );
    }
  }

  res.status(200).json({ status: 'success' });
}
```

---

## 📅 WEEK 2: Background Jobs & Notifications (P0)

**Goal:** Automated processes and user engagement  
**Days:** 7 days

### Day 8-9: Bull Queue Setup

**Dependencies:**
```bash
npm install bull @types/bull ioredis @types/ioredis
```

**Files to Create:**
```
src/queues/index.ts
src/jobs/escrow-release.job.ts
src/jobs/match-expiration.job.ts
src/jobs/cycle-reminders.job.ts
```

**Tasks:**
- [ ] Install Redis (local or cloud)
- [ ] Set up Bull queues
- [ ] Create escrow release job
- [ ] Create match expiration job
- [ ] Create cycle reminder job
- [ ] Add job scheduling
- [ ] Test job execution

---

### Day 10-11: Push Notifications

**Dependencies:**
```bash
npm install firebase-admin
```

**Files to Create:**
```
src/services/notification.service.ts
src/models/deviceToken.model.ts (add to Prisma)
```

**Tasks:**
- [ ] Set up Firebase Admin SDK
- [ ] Create notification service
- [ ] Add device token storage
- [ ] Create notification templates
- [ ] Integrate with donation flow
- [ ] Integrate with wallet operations
- [ ] Test on real devices

---

### Day 12-13: Email Service

**Dependencies:**
```bash
npm install nodemailer @types/nodemailer
```

**Files to Create:**
```
src/services/email.service.ts
src/templates/email/
├── welcome.html
├── receipt.html
└── reminder.html
```

**Tasks:**
- [ ] Set up Nodemailer
- [ ] Create email templates
- [ ] Implement welcome email
- [ ] Implement transaction receipts
- [ ] Implement password reset emails
- [ ] Test email delivery

---

### Day 14: Job Monitoring & Cleanup

**Tasks:**
- [ ] Add Bull dashboard for monitoring
- [ ] Set up job retry logic
- [ ] Add job failure handling
- [ ] Create cleanup scripts
- [ ] Document job processes

---

## 📅 WEEK 3: File Upload & Verification (P1)

**Goal:** KYC and document handling  
**Days:** 7 days

### Day 15-16: AWS S3 File Upload

**Dependencies:**
```bash
npm install aws-sdk multer @types/multer
```

**Files to Create:**
```
src/services/storage.service.ts
src/middleware/upload.ts
src/routes/upload.routes.ts
```

**Tasks:**
- [ ] Set up AWS S3 bucket
- [ ] Create upload service
- [ ] Add file validation
- [ ] Create upload endpoints
- [ ] Handle image optimization
- [ ] Test file uploads

---

### Day 17-18: BVN Verification

**Dependencies:**
```bash
npm install axios
```

**Files to Create:**
```
src/services/verification/bvn.service.ts
src/routes/kyc.routes.ts
src/controllers/kyc.controller.ts
```

**Tasks:**
- [ ] Integrate with Smile Identity or Okra
- [ ] Create BVN verification endpoint
- [ ] Update user tier on verification
- [ ] Store verification records
- [ ] Test with test BVNs

---

### Day 19-20: Admin Endpoints

**Files to Create:**
```
src/routes/admin.routes.ts
src/controllers/admin.controller.ts
src/middleware/adminAuth.ts
```

**Tasks:**
- [ ] Create admin role middleware
- [ ] Add user management endpoints
- [ ] Add transaction approval endpoints
- [ ] Add marketplace management
- [ ] Create admin dashboard stats
- [ ] Test admin functions

---

### Day 21: Documentation Update

**Tasks:**
- [ ] Update API documentation
- [ ] Add webhook documentation
- [ ] Document new endpoints
- [ ] Update setup guide
- [ ] Create troubleshooting guide

---

## 📅 WEEK 4: Testing & Polish (Launch Prep)

**Goal:** Production readiness  
**Days:** 9 days

### Day 22-24: Testing

**Dependencies:**
```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```

**Tasks:**
- [ ] Set up Jest configuration
- [ ] Write unit tests for services
- [ ] Write controller tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Achieve 60%+ coverage

---

### Day 25-26: Deployment

**Files to Create:**
```
Dockerfile
docker-compose.yml
.github/workflows/deploy.yml
```

**Tasks:**
- [ ] Create Dockerfile
- [ ] Set up Docker Compose
- [ ] Configure CI/CD pipeline
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production

---

### Day 27-28: Monitoring & Analytics

**Dependencies:**
```bash
npm install mixpanel @sentry/node
```

**Tasks:**
- [ ] Set up Sentry error tracking
- [ ] Add Mixpanel analytics
- [ ] Create event tracking
- [ ] Set up logging aggregation
- [ ] Configure alerts

---

### Day 29-30: Final Testing & Launch

**Tasks:**
- [ ] Load testing
- [ ] Security audit
- [ ] Fix critical bugs
- [ ] Prepare launch checklist
- [ ] Go live! 🚀

---

## 📊 Milestone Checklist

### Milestone 1: MVP (End of Week 2)
- [x] Core API endpoints
- [ ] Payment integration
- [ ] SMS delivery
- [ ] Background jobs
- [ ] Push notifications

### Milestone 2: Beta (End of Week 3)
- [ ] File uploads
- [ ] KYC verification
- [ ] Admin panel
- [ ] Email notifications

### Milestone 3: Production (End of Week 4)
- [ ] Testing complete
- [ ] Deployed to cloud
- [ ] Monitoring active
- [ ] Documentation complete

---

## 🎯 Success Criteria

By end of 4 weeks:
- ✅ All P0 features implemented
- ✅ Payment flow working end-to-end
- ✅ Notifications active
- ✅ 60%+ test coverage
- ✅ Deployed to production
- ✅ Monitoring enabled
- ✅ Ready for 100 beta users

---

## 💡 Quick Wins (Do First)

1. **Day 1:** Flutterwave test integration (4 hours)
2. **Day 5:** Twilio SMS (2 hours)
3. **Day 8:** Basic job queue (3 hours)
4. **Day 10:** Push notifications (4 hours)

These unlock immediate value!

---

## 🚨 Blockers & Dependencies

| Feature | Depends On | Provider |
|---------|-----------|----------|
| Deposits | Flutterwave API keys | Flutterwave |
| Withdrawals | Paystack API keys | Paystack |
| SMS OTP | Twilio account | Twilio |
| Push Notifications | Firebase project | Firebase |
| BVN Verification | Smile Identity account | Smile ID |
| File Upload | AWS S3 bucket | AWS |

**Action:** Sign up for all providers in Week 1!

---

## 📞 Support Resources

- **Flutterwave Docs:** https://developer.flutterwave.com
- **Paystack Docs:** https://paystack.com/docs
- **Twilio Docs:** https://www.twilio.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Bull Docs:** https://github.com/OptimalBits/bull

---

**Roadmap Created:** October 6, 2025  
**Target Launch:** November 5, 2025 (30 days)

*Let's build ChainGive! 🚀*
