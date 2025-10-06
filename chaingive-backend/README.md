# 🏗️ ChainGive Backend API

**Version:** 1.0.0  
**Node.js:** 20+ LTS  
**Database:** PostgreSQL 15+  
**Framework:** Express.js + TypeScript + Prisma ORM

---

## 📖 Overview

ChainGive Backend is a comprehensive Node.js/Express API server that powers the ChainGive peer-to-peer donation platform. It implements a microservices-inspired architecture with:

- ✅ **Authentication & Authorization** (JWT-based)
- ✅ **Wallet Management** (Deposits, Withdrawals, Balances)
- ✅ **Donation Cycles** (Give, Receive, Confirm Receipt)
- ✅ **Matching Algorithm** (Smart recipient matching)
- ✅ **Marketplace** (Charity Coins redemption)
- ✅ **Agent Network** (KYC verification, Cash deposits)
- ✅ **Security** (Rate limiting, Input validation, Error handling)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis (optional, for production caching)
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
cd chaingive-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database:**
```bash
# Create PostgreSQL database
createdb chaingive_db

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

5. **Start development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

---

## 📂 Project Structure

```
chaingive-backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── wallet.controller.ts
│   │   ├── donation.controller.ts
│   │   ├── cycle.controller.ts
│   │   ├── marketplace.controller.ts
│   │   ├── agent.controller.ts
│   │   ├── match.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── validation.ts    # Request validation
│   │   ├── errorHandler.ts  # Error handling
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   └── notFoundHandler.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── wallet.routes.ts
│   │   ├── donation.routes.ts
│   │   ├── cycle.routes.ts
│   │   ├── marketplace.routes.ts
│   │   ├── agent.routes.ts
│   │   ├── match.routes.ts
│   │   └── user.routes.ts
│   ├── services/            # Business logic
│   │   ├── otp.service.ts
│   │   └── matching.service.ts
│   ├── validations/         # Joi schemas
│   │   ├── auth.validation.ts
│   │   ├── wallet.validation.ts
│   │   ├── donation.validation.ts
│   │   ├── user.validation.ts
│   │   ├── marketplace.validation.ts
│   │   └── agent.validation.ts
│   ├── utils/               # Utilities
│   │   ├── logger.ts
│   │   └── prisma.ts
│   └── server.ts            # Entry point
├── prisma/
│   └── schema.prisma        # Database schema
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/v1
```

### Authentication Endpoints

#### Register User
```http
POST /v1/auth/register
Content-Type: application/json

{
  "phoneNumber": "+2348012345678",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Adeyemi",
  "lastName": "Okonkwo"
}
```

#### Login
```http
POST /v1/auth/login
Content-Type: application/json

{
  "phoneNumber": "+2348012345678",
  "password": "SecurePass123!"
}
```

#### Verify OTP
```http
POST /v1/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+2348012345678",
  "otp": "123456"
}
```

### Wallet Endpoints (Protected)

#### Get Balance
```http
GET /v1/wallet/balance
Authorization: Bearer <token>
```

#### Initiate Deposit
```http
POST /v1/wallet/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "paymentMethod": "bank_transfer"
}
```

#### Initiate Withdrawal
```http
POST /v1/wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 3000,
  "bankCode": "044",
  "accountNumber": "0123456789",
  "accountName": "Adeyemi Okonkwo"
}
```

### Donation Endpoints (Protected)

#### Give Donation
```http
POST /v1/donations/give
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "recipientPreference": "algorithm",
  "locationPreference": "Lagos"
}
```

#### Confirm Receipt
```http
POST /v1/donations/confirm-receipt
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "uuid",
  "confirm": true
}
```

### Marketplace Endpoints

#### Get Listings
```http
GET /v1/marketplace/listings?category=airtime&limit=20
```

#### Redeem Item (Protected)
```http
POST /v1/marketplace/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "uuid",
  "quantity": 1,
  "deliveryPhone": "+2348012345678"
}
```

---

## 🗄️ Database Schema

The database uses PostgreSQL with Prisma ORM. Key tables:

- **users** - User accounts and profiles
- **wallets** - User wallet balances
- **transactions** - All financial transactions
- **escrows** - Escrow holdings (48-hour hold)
- **cycles** - Donation cycles (receive → give forward)
- **matches** - Donor-recipient matching
- **kyc_records** - KYC verification records
- **agents** - Agent network members
- **marketplace_listings** - Items for redemption
- **redemptions** - Charity Coins redemptions
- **blockchain_logs** - Polygon transaction logs

See `prisma/schema.prisma` for complete schema definition.

---

## 🔐 Security Features

### Authentication
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (cost factor: 12)
- OTP verification for phone numbers
- Token expiration: 1 hour (access), 30 days (refresh)

### Authorization
- Role-based access control (beginner, agent, power_partner, csc_council)
- Tier-based permissions (1, 2, 3)
- Protected routes with middleware

### Input Validation
- Joi schemas for all request bodies
- Phone number format: `+234XXXXXXXXXX`
- Password requirements: min 8 chars, uppercase, lowercase, number, special char
- Amount limits: deposits (₦100-₦1M), withdrawals (₦500-₦1M)

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable via environment variables

### Error Handling
- Centralized error handling middleware
- Structured error responses
- Detailed logging with Winston
- Stack traces in development only

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Manual Testing
Use the included Postman collection or test with curl:

```bash
# Register
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "password": "Test123!"
  }'
```

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-refresh-secret>
REDIS_HOST=<redis-host>
REDIS_PORT=6379
```

### Deployment Platforms
- **AWS EC2** (recommended)
- **Heroku**
- **DigitalOcean**
- **Railway**

### Docker Support (Coming Soon)
```bash
docker build -t chaingive-backend .
docker run -p 3000:3000 chaingive-backend
```

---

## 📊 Monitoring & Logging

### Logging
- Winston logger with multiple transports
- Log levels: error, warn, info, debug
- File logs: `logs/error.log`, `logs/combined.log`
- Console logs with colorization

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-06T12:00:00.000Z",
  "uptime": 12345,
  "environment": "development"
}
```

---

## 🔧 Development

### Development Server (with auto-reload)
```bash
npm run dev
```

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional error details
    }
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test thoroughly
3. Commit with descriptive messages
4. Push and create a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

- **Email:** dev@chaingive.ng
- **Documentation:** https://docs.chaingive.ng
- **GitHub Issues:** https://github.com/chaingive/backend/issues

---

## 🎯 Roadmap

### Completed ✅
- [x] Authentication & JWT
- [x] Wallet management
- [x] Donation cycles
- [x] Matching algorithm
- [x] Marketplace
- [x] Agent network
- [x] Input validation
- [x] Error handling

### In Progress 🚧
- [ ] Payment provider integration (Flutterwave, Paystack)
- [ ] SMS integration (Twilio)
- [ ] Email notifications
- [ ] Push notifications (Firebase)

### Planned 📅
- [ ] Blockchain integration (Polygon)
- [ ] Identity verification (BVN, NIN)
- [ ] Analytics (Mixpanel)
- [ ] Automated testing (Jest, Supertest)
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Load testing
- [ ] API documentation (Swagger)

---

**Built with ❤️ by the ChainGive Team**

*"You don't donate to get back. You donate because someone once gave to you."*
