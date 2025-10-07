# 🎉 ChainGive - P2P Donation Platform

**The Ethical Peer-to-Peer Altruism Engine**

---

## 📁 **Repository Structure**

```
/
├── chaingive-backend/      # Node.js/Express Backend API
├── chaingive-mobile/       # React Native Mobile App
├── specs/                  # All documentation files
├── .github/workflows/      # CI/CD workflows
└── README.md              # This file
```

---

## 🚀 **Quick Start**

### **Backend (API)**
```bash
cd chaingive-backend
npm install
npm run dev
```

### **Mobile App**
```bash
cd chaingive-mobile
npm install
npm start
```

---

## 📚 **Documentation**

All documentation is located in the `/specs` folder:

- **Backend Deployment:** See specs/RAILWAY-DEPLOYMENT-GUIDE.md
- **Mobile Deployment:** See specs/EAS-DEPLOYMENT-GUIDE.md
- **Testing:** See specs/MOBILE-TESTING-GUIDE.md
- **CI/CD:** See .github/workflows/SETUP-GUIDE.md

---

## 🏗️ **Tech Stack**

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- Redis + Bull (Background Jobs)
- JWT Authentication
- Sentry Error Tracking

**Mobile:**
- React Native
- Redux Toolkit
- React Navigation
- Expo (for builds)
- TypeScript

**Infrastructure:**
- Docker
- Railway / Koyeb
- GitHub Actions
- Supabase (Database)

---

## 🌟 **Features**

- ✅ User Authentication (Register, Login, OTP)
- ✅ P2P Donation Cycles
- ✅ Agent-Based Coin Distribution
- ✅ Gamification (Missions, Achievements, Challenges)
- ✅ Leaderboard System
- ✅ Referral Program
- ✅ Marketplace Redemptions
- ✅ KYC Verification
- ✅ Multi-tier Permissions
- ✅ Admin Dashboard
- ✅ Real-time Notifications

---

## 🚀 **Deployment**

### **Backend (Railway)**
1. Fork this repository
2. Connect to Railway
3. Select `chaingive-backend` as root directory
4. Add environment variables
5. Deploy!

See: `specs/RAILWAY-DEPLOYMENT-GUIDE.md`

### **Mobile (EAS)**
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build: `eas build --platform android --profile preview`

See: `specs/EAS-DEPLOYMENT-GUIDE.md`

---

## 📱 **Download App**

Coming soon to:
- Google Play Store
- Apple App Store

---

## 🤝 **Contributing**

We welcome contributions! See `specs/CONTRIBUTING.md` for guidelines.

---

## 📄 **License**

MIT License - See LICENSE file for details

---

## 📞 **Support**

- Documentation: `/specs` folder
- Issues: GitHub Issues
- Email: support@chaingive.ng

---

**Built with ❤️ for making the world better through giving**
