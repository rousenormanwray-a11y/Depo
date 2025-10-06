# 📚 ChainGive API Quick Reference

Quick reference guide for all API endpoints with example requests and responses.

**Base URL:** `http://localhost:3000/v1`  
**Authentication:** Bearer token in `Authorization` header

---

## 🔐 Authentication

### 1. Register New User

```bash
POST /v1/auth/register
```

**Request:**
```json
{
  "phoneNumber": "+2348012345678",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Adeyemi",
  "lastName": "Okonkwo",
  "locationCity": "Lagos",
  "locationState": "Lagos"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your phone number.",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phoneNumber": "+2348012345678",
      "email": "user@example.com",
      "firstName": "Adeyemi",
      "lastName": "Okonkwo",
      "role": "beginner",
      "tier": 1
    },
    "requiresOTP": true
  }
}
```

---

### 2. Login

```bash
POST /v1/auth/login
```

**Request:**
```json
{
  "phoneNumber": "+2348012345678",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phoneNumber": "+2348012345678",
      "email": "user@example.com",
      "firstName": "Adeyemi",
      "lastName": "Okonkwo",
      "role": "beginner",
      "tier": 1,
      "trustScore": "5.00",
      "charityCoinsBalance": 0,
      "wallet": {
        "fiatBalance": "0.00",
        "receivableBalance": "0.00",
        "pendingObligations": "0.00"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Verify OTP

```bash
POST /v1/auth/verify-otp
```

**Request:**
```json
{
  "phoneNumber": "+2348012345678",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

---

### 4. Resend OTP

```bash
POST /v1/auth/resend-otp
```

**Request:**
```json
{
  "phoneNumber": "+2348012345678"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### 5. Refresh Token

```bash
POST /v1/auth/refresh-token
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👤 User Management

### 6. Get Current User Profile

```bash
GET /v1/users/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phoneNumber": "+2348012345678",
    "email": "user@example.com",
    "firstName": "Adeyemi",
    "lastName": "Okonkwo",
    "role": "beginner",
    "tier": 1,
    "trustScore": "5.00",
    "totalCyclesCompleted": 0,
    "totalDonated": "0.00",
    "totalReceived": "0.00",
    "charityCoinsBalance": 0,
    "kycStatus": "pending",
    "preferredLanguage": "en",
    "locationCity": "Lagos",
    "locationState": "Lagos",
    "wallet": {
      "fiatBalance": "0.00",
      "receivableBalance": "0.00",
      "pendingObligations": "0.00"
    }
  }
}
```

---

### 7. Update Profile

```bash
PATCH /v1/users/me
Authorization: Bearer <token>
```

**Request:**
```json
{
  "firstName": "Adeyemi",
  "locationCity": "Abuja",
  "preferredLanguage": "yo"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 8. Get User Statistics

```bash
GET /v1/users/stats
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalDonated": "15000.00",
    "totalReceived": "10000.00",
    "totalCyclesCompleted": 3,
    "charityCoinsBalance": 150,
    "trustScore": "4.85",
    "donationsSent": 3,
    "donationsReceived": 2,
    "avgCycleCompletionDays": 15
  }
}
```

---

## 💰 Wallet Management

### 9. Get Wallet Balance

```bash
GET /v1/wallet/balance
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "fiatBalance": "5000.00",
    "receivableBalance": "2000.00",
    "pendingObligations": "3000.00",
    "charityCoins": 245,
    "totalInflows": "15000.00",
    "totalOutflows": "10000.00"
  }
}
```

---

### 10. Initiate Deposit

```bash
POST /v1/wallet/deposit
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 5000,
  "paymentMethod": "bank_transfer",
  "paymentProofUrl": "https://s3.amazonaws.com/receipts/proof.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "transactionRef": "TXN-20251006-12345",
    "amount": 5000,
    "status": "pending",
    "paymentInstructions": {
      "bankName": "First Bank",
      "accountNumber": "1234567890",
      "accountName": "ChainGive Escrow",
      "reference": "TXN-20251006-12345"
    }
  }
}
```

---

### 11. Initiate Withdrawal

```bash
POST /v1/wallet/withdraw
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 3000,
  "bankCode": "044",
  "accountNumber": "0123456789",
  "accountName": "Adeyemi Okonkwo"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "transactionRef": "TXN-20251006-12346",
    "amount": 3000,
    "fee": 50,
    "netAmount": 2950,
    "status": "processing"
  }
}
```

---

### 12. Get Transaction History

```bash
GET /v1/wallet/transactions?limit=20&offset=0&type=deposit&status=completed
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "transactionRef": "TXN-20251006-12345",
        "type": "deposit",
        "amount": "5000.00",
        "fee": "0.00",
        "netAmount": "5000.00",
        "status": "completed",
        "paymentMethod": "bank_transfer",
        "createdAt": "2025-10-06T10:00:00Z",
        "completedAt": "2025-10-06T10:30:00Z",
        "fromUser": null,
        "toUser": {
          "firstName": "Adeyemi",
          "lastName": "Okonkwo"
        }
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

### 13. Get Transaction by ID

```bash
GET /v1/wallet/transactions/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "transactionRef": "TXN-20251006-12345",
    "type": "donation_sent",
    "amount": "5000.00",
    "status": "completed",
    "fromUser": { ... },
    "toUser": { ... },
    "escrows": [ ... ],
    "blockchainLog": { ... }
  }
}
```

---

## 💚 Donations

### 14. Give Donation (Algorithm Match)

```bash
POST /v1/donations/give
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 5000,
  "recipientPreference": "algorithm",
  "locationPreference": "Lagos"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "transactionRef": "TXN-20251006-12347",
    "recipient": {
      "id": "uuid",
      "firstName": "Fatima",
      "location": "Lagos",
      "trustScore": "4.70"
    },
    "amount": 5000,
    "status": "in_transit",
    "escrowReleaseAt": "2025-10-08T10:00:00Z"
  }
}
```

---

### 15. Give Donation (Manual Selection)

```bash
POST /v1/donations/give
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 5000,
  "recipientPreference": "manual",
  "recipientId": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

### 16. Confirm Receipt

```bash
POST /v1/donations/confirm-receipt
Authorization: Bearer <token>
```

**Request:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "confirm": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Receipt confirmed. Funds will be released in 48 hours.",
  "data": {
    "escrowReleaseAt": "2025-10-08T10:00:00Z"
  }
}
```

---

## 🔄 Cycles

### 17. Get Cycles

```bash
GET /v1/cycles?status=fulfilled&limit=10&offset=0
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cycles": [
      {
        "id": "uuid",
        "userId": "uuid",
        "amount": "5000.00",
        "status": "fulfilled",
        "receivedFromUserId": "uuid",
        "givenToUserId": "uuid",
        "receivedAt": "2025-09-15T10:00:00Z",
        "fulfilledAt": "2025-09-25T14:00:00Z",
        "daysToFulfill": 10,
        "charityCoinsEarned": 50
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 18. Get Cycle by ID

```bash
GET /v1/cycles/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": "5000.00",
    "status": "obligated",
    "dueDate": "2025-12-01",
    ...
  }
}
```

---

## 🛍️ Marketplace

### 19. Get Marketplace Listings (Public)

```bash
GET /v1/marketplace/listings?category=airtime&limit=20&offset=0
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "uuid",
        "vendorName": "MTN Nigeria",
        "itemName": "₦100 Airtime",
        "description": "Instant MTN airtime recharge",
        "category": "airtime",
        "coinPrice": 50,
        "realValue": "100.00",
        "stockQuantity": 1000,
        "isInStock": true,
        "rating": "4.80",
        "totalRatings": 245,
        "totalRedemptions": 1230,
        "imageUrl": "https://...",
        "isActive": true
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 20. Get Listing by ID (Public)

```bash
GET /v1/marketplace/listings/:id
```

---

### 21. Redeem Item

```bash
POST /v1/marketplace/redeem
Authorization: Bearer <token>
```

**Request:**
```json
{
  "listingId": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 1,
  "deliveryPhone": "+2348012345678"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "redemptionId": "uuid",
    "coinsSpent": 50,
    "status": "processing",
    "estimatedDelivery": "Instant"
  }
}
```

---

### 22. Get Redemption History

```bash
GET /v1/marketplace/redemptions?limit=20&offset=0
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "redemptions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "coinsSpent": 50,
        "realValue": "100.00",
        "status": "completed",
        "deliveryMethod": "instant",
        "createdAt": "2025-10-06T10:00:00Z",
        "completedAt": "2025-10-06T10:01:00Z",
        "listing": {
          "vendorName": "MTN Nigeria",
          "itemName": "₦100 Airtime"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 🤝 Matching

### 23. Get Pending Matches

```bash
GET /v1/matches/pending
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "uuid",
        "donor": {
          "firstName": "Emeka",
          "locationCity": "Lagos",
          "trustScore": "4.90"
        },
        "amount": "5000.00",
        "priorityScore": "85.50",
        "matchedAt": "2025-10-06T08:00:00Z",
        "expiresAt": "2025-10-07T08:00:00Z"
      }
    ]
  }
}
```

---

### 24. Accept Match

```bash
POST /v1/matches/:id/accept
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Match accepted. Awaiting donor transfer."
}
```

---

### 25. Reject Match

```bash
POST /v1/matches/:id/reject
Authorization: Bearer <token>
```

**Request:**
```json
{
  "reason": "Amount too high for my current need"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Match rejected"
}
```

---

## 👮 Agent Features

### 26. Get Agent Dashboard

```bash
GET /v1/agents/dashboard
Authorization: Bearer <token>
```

**Requires:** Agent role

**Response (200):**
```json
{
  "success": true,
  "data": {
    "agentCode": "AG-LAG-001",
    "totalVerifications": 245,
    "totalCommissions": "24500.00",
    "rating": "4.85",
    "pendingVerifications": 12,
    "isActive": true
  }
}
```

---

### 27. Verify User

```bash
POST /v1/agents/verify-user
Authorization: Bearer <token>
```

**Requires:** Agent role

**Request:**
```json
{
  "phoneNumber": "+2348012345678",
  "verificationType": "bvn",
  "verificationData": {
    "bvn": "12345678901",
    "selfieUrl": "https://..."
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User verified successfully",
  "data": {
    "kycRecordId": "uuid",
    "commission": 100
  }
}
```

---

### 28. Log Cash Deposit

```bash
POST /v1/agents/cash-deposit
Authorization: Bearer <token>
```

**Requires:** Agent role

**Request:**
```json
{
  "phoneNumber": "+2348012345678",
  "amount": 5000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Cash deposit logged successfully",
  "data": {
    "transactionRef": "TXN-20251006-12348",
    "amount": 5000,
    "fee": 100,
    "netAmount": 4900,
    "commission": 100
  }
}
```

---

## ⚠️ Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error",
    "details": [
      {
        "field": "phoneNumber",
        "message": "Phone number must be in format +234XXXXXXXXXX"
      }
    ]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided"
  }
}
```

### Insufficient Balance (400)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Your wallet balance is insufficient",
    "details": {
      "required": 5000,
      "available": 3500
    }
  }
}
```

### Rate Limit (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

---

## 💡 Tips

1. **Always include `Content-Type: application/json`** header
2. **Store tokens securely** (never in localStorage on web)
3. **Refresh tokens** before they expire (1 hour for access tokens)
4. **Handle errors gracefully** - check `success` field first
5. **Use pagination** for large lists (`limit` and `offset`)
6. **Phone numbers** must always be in format `+234XXXXXXXXXX`
7. **Check OTP in logs** during development (not sent via SMS yet)

---

## 🧪 Testing Flow

1. Register user → Get OTP from logs → Verify OTP → Get token
2. Use token for all subsequent requests
3. Add money via deposit
4. Give donation
5. Recipient confirms receipt
6. Earn Charity Coins
7. Redeem in marketplace

---

**Updated:** October 6, 2025
