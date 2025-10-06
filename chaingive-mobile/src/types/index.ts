// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  trustScore: number;
  isAgent: boolean;
  isVerified: boolean;
  // Aggregated wallet fields for convenient access in UI
  // Source of truth may live in Wallet; these are mirrored snapshots
  balance?: number;
  charityCoins?: number;
  createdAt: string;
  updatedAt: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  charityCoins: number;
  totalDonated: number;
  totalReceived: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'donation_sent' | 'donation_received' | 'redemption';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

// Donation Cycle Types
export interface DonationCycle {
  id: string;
  donorId: string;
  recipientId: string;
  amount: number;
  status: 'pending' | 'matched' | 'confirmed' | 'completed' | 'defaulted';
  dueDate: string;
  confirmedAt?: string;
  completedAt?: string;
  charityCoinsEarned: number;
  createdAt: string;
  updatedAt: string;
}

// Marketplace Types
export interface MarketplaceItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  category: 'airtime' | 'data' | 'vouchers' | 'services';
  price: number; // in Charity Coins
  originalPrice?: number; // in Naira
  image: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Redemption {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  totalCoins: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  deliveryInfo?: {
    phoneNumber?: string;
    email?: string;
    address?: string;
  };
  voucherCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Checklist Types
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'setup' | 'verification' | 'donation' | 'marketplace';
  order: number;
  requiredFor?: string; // What this unlocks
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  userId: string;
  completedItems: string[];
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  updatedAt: string;
}

// Agent Types
export interface Agent {
  id: string;
  userId: string;
  agentCode: string;
  location: {
    state: string;
    city: string;
    address: string;
  };
  rating: number;
  totalVerifications: number;
  totalDeposits: number;
  commissionEarned: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  agentId: string;
  type: 'tier2' | 'tier3';
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    selfie?: string;
    idCard?: string;
    utilityBill?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OTP: { phoneNumber: string };
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Marketplace: undefined;
  Profile: undefined;
  Agent?: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  GiveScreen: undefined;
  DepositScreen: undefined;
  WithdrawScreen: undefined;
  TransactionHistory: undefined;
  TransactionDetail: { transactionId: string };
  CycleDetail: { cycleId: string };
  CycleHistory: undefined;
};

export type MarketplaceStackParamList = {
  MarketplaceScreen: undefined;
  ItemDetail: { itemId: string };
  Checkout: { itemId: string; quantity: number };
  RedemptionHistory: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  KYCVerification: undefined;
  Help: undefined;
  Notifications: undefined;
};

export type AgentStackParamList = {
  AgentDashboard: undefined;
  VerifyUser: undefined;
  CashDeposit: undefined;
  VerificationDetail: { requestId: string };
};