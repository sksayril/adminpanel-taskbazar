// const BASE_URL = 'https://7cvccltb-3111.inc1.devtunnels.ms/admin';
// const BASE_URL = 'https://proftkaro-backendpapi.vercel.app/admin';
const BASE_URL = 'https://apitask.seotube.in/admin';
// const BASE_URL = 'https://apiprofit.seotube.in/admin';
// neww
// const BASE_URL = 'http://localhost:3111/admin';

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface SignupRequest {
  Email: string;
  Password: string;
}

export interface AuthResponse {
  message: string;
  data: {
    Email: string;
    _id?: string;
    Password?: string;
  };
  token: string;
}

export interface ErrorResponse {
  message: string;
  error?: string;
}

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

// Save token to localStorage
export const saveToken = (token: string): void => {
  localStorage.setItem('adminToken', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('adminToken');
};

// Admin Signup API
export const adminSignup = async (data: SignupRequest): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Signup failed');
  }

  // Save token to localStorage
  if (result.token) {
    saveToken(result.token);
  }

  return result;
};

// Admin Login API
export const adminLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Login failed');
  }

  // Save token to localStorage
  if (result.token) {
    saveToken(result.token);
  }

  return result;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Captcha Settings Interfaces
export interface CaptchaSettingsRequest {
  DailyCaptchaLimit: number;
  RewardPerCaptcha: number;
  RewardType: 'Coins' | 'WalletBalance';
}

export interface CaptchaSettingsResponse {
  message: string;
  data: {
    _id: string;
    DailyCaptchaLimit: number;
    RewardPerCaptcha: number;
    RewardType: 'Coins' | 'WalletBalance';
    __v?: number;
  };
}

// Token expiration handler
let tokenExpirationHandler: (() => void) | null = null;

export const setTokenExpirationHandler = (handler: () => void) => {
  tokenExpirationHandler = handler;
};

// Get authenticated request headers
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API response and check for token expiration
const handleApiResponse = async (response: Response): Promise<any> => {
  const result = await response.json();

  // Check for token expiration (401 status)
  if (response.status === 401) {
    if (tokenExpirationHandler) {
      tokenExpirationHandler();
    }
    throw new Error('Token expired. Please login again.');
  }

  if (!response.ok) {
    throw new Error(result.message || 'Request failed');
  }

  return result;
};

// Set Captcha Settings API
export const setCaptchaSettings = async (data: CaptchaSettingsRequest): Promise<CaptchaSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/captcha/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Captcha Settings API
export const getCaptchaSettings = async (): Promise<CaptchaSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/captcha/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Daily Spin Settings Interfaces
export interface DailySpinSettingsRequest {
  DailySpinLimit: number;
}

export interface DailySpinSettingsResponse {
  message: string;
  data: {
    _id: string;
    DailySpinLimit: number;
    __v?: number;
  };
}

// Set Daily Spin Settings API
export const setDailySpinSettings = async (data: DailySpinSettingsRequest): Promise<DailySpinSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/dailyspin/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Daily Spin Settings API
export const getDailySpinSettings = async (): Promise<DailySpinSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/dailyspin/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Referral Settings Interfaces
export interface ReferralSettingsRequest {
  RewardForNewUser: number;
  RewardForReferrer: number;
  RewardType: 'Coins' | 'WalletBalance';
}

export interface ReferralSettingsResponse {
  message: string;
  data: {
    _id: string;
    RewardForNewUser: number;
    RewardForReferrer: number;
    RewardType: 'Coins' | 'WalletBalance';
    __v?: number;
  };
}

// Set Referral Settings API
export const setReferralSettings = async (data: ReferralSettingsRequest): Promise<ReferralSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/referral/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Referral Settings API
export const getReferralSettings = async (): Promise<ReferralSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/referral/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Daily Bonus Settings Interfaces
export interface DailyBonusSettingsRequest {
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
  RewardType: 'Coins' | 'WalletBalance';
}

export interface DailyBonusSettingsResponse {
  message: string;
  data: {
    _id: string;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    Sunday: number;
    RewardType: 'Coins' | 'WalletBalance';
    __v?: number;
  };
}

// Set Daily Bonus Settings API
export const setDailyBonusSettings = async (data: DailyBonusSettingsRequest): Promise<DailyBonusSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/dailybonus/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Daily Bonus Settings API
export const getDailyBonusSettings = async (): Promise<DailyBonusSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/dailybonus/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Withdrawal Request Interfaces

export interface EarningSourceBreakdown {
  count: number;
  coins: number;
}

export interface EarningBreakdown {
  currentCoins: number;
  currentWalletBalance: number;
  totalEarnedCoins: number;
  redeemedCoins: number;
  convertedAmount: number;
  totalWithdrawn: number;
  isVerified: boolean;
  verifiedAt?: string | null;
  sources: {
    taskCompletion: EarningSourceBreakdown;
    referral: EarningSourceBreakdown;
    offerwall: EarningSourceBreakdown;
    scratchCard: EarningSourceBreakdown;
    spinWheel: EarningSourceBreakdown;
    dailyBonus: EarningSourceBreakdown;
    captcha: EarningSourceBreakdown;
  };
  withdrawalsSummary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recentTransactions: Array<{
    id: string;
    type: 'Credit' | 'Debit';
    source: string;
    coins: number;
    balanceAfter: number;
    description: string;
    date: string;
  }>;
}

export interface WithdrawalRequest {
  requestId: string;
  userId: string;
  userName?: string;
  userMobileNumber: string;
  userReferCode?: string;
  userSignupTime?: string | null;
  userDeviceId: string;
  amount: number;
  paymentMethod: 'UPI' | 'BankTransfer';
  upiId?: string | null;
  virtualId?: string | null;
  bankAccountNumber?: string | null;
  bankIFSC?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  qrCodeImage?: string | null;
  paymentProof?: string | null;
  isVerified?: boolean;
  verifiedAt?: string | null;
  userCoins?: number;
  userWalletBalance?: number;
  earningBreakdown?: EarningBreakdown | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequestsResponse {
  message: string;
  data: {
    requests: WithdrawalRequest[];
    totalRequests: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

export interface UpdateWithdrawalStatusRequest {
  status: 'Approved' | 'Rejected';
  adminNotes?: string;
}

export interface UpdateWithdrawalStatusResponse {
  message: string;
  data: {
    requestId: string;
    amount: number;
    paymentMethod: string;
    status: string;
    adminNotes?: string | null;
    userWalletBalance: number;
    updatedAt: string;
  };
}

// Get Withdrawal Requests API
export const getWithdrawalRequests = async (status?: 'Pending' | 'Approved' | 'Rejected'): Promise<WithdrawalRequestsResponse> => {
  const url = status
    ? `${BASE_URL}/withdrawal/requests?status=${status}`
    : `${BASE_URL}/withdrawal/requests`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update Withdrawal Request Status API
export const updateWithdrawalStatus = async (
  requestId: string,
  data: UpdateWithdrawalStatusRequest
): Promise<UpdateWithdrawalStatusResponse> => {
  const response = await fetch(`${BASE_URL}/withdrawal/request/${requestId}/status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// --- Gift voucher withdrawal requests (GET/POST /admin/gift-voucher/...) ---

export type GiftVoucherRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Delivered';

export interface GiftVoucherRequest {
  requestId: string;
  userId: string;
  userMobileNumber: string;
  userDeviceId: string;
  type: string;
  brand: string;
  amount: number;
  status: GiftVoucherRequestStatus;
  voucherCode: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GiftVoucherRequestsResponse {
  message: string;
  data: {
    requests: GiftVoucherRequest[];
    totalRequests: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    deliveredCount: number;
  };
}

export interface GiftVoucherApproveRejectBody {
  adminNotes?: string;
}

export interface GiftVoucherDeliverBody {
  voucherCode: string;
  adminNotes?: string;
}

export interface GiftVoucherActionResponse {
  message: string;
  data: {
    requestId: string;
    type?: string;
    brand?: string;
    amount: number;
    status: GiftVoucherRequestStatus | string;
    voucherCode?: string | null;
    adminNotes?: string | null;
    userWalletBalance: number;
    updatedAt: string;
  };
}

export const getGiftVoucherRequests = async (
  status?: GiftVoucherRequestStatus
): Promise<GiftVoucherRequestsResponse> => {
  const url = status
    ? `${BASE_URL}/gift-voucher/requests?status=${encodeURIComponent(status)}`
    : `${BASE_URL}/gift-voucher/requests`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

export const approveGiftVoucherRequest = async (
  requestId: string,
  body?: GiftVoucherApproveRejectBody
): Promise<GiftVoucherActionResponse> => {
  const response = await fetch(`${BASE_URL}/gift-voucher/request/${requestId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  return handleApiResponse(response);
};

export const rejectGiftVoucherRequest = async (
  requestId: string,
  body?: GiftVoucherApproveRejectBody
): Promise<GiftVoucherActionResponse> => {
  const response = await fetch(`${BASE_URL}/gift-voucher/request/${requestId}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  return handleApiResponse(response);
};

export const deliverGiftVoucherRequest = async (
  requestId: string,
  body: GiftVoucherDeliverBody
): Promise<GiftVoucherActionResponse> => {
  const response = await fetch(`${BASE_URL}/gift-voucher/request/${requestId}/deliver`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleApiResponse(response);
};

// User Management Interfaces
export interface User {
  userId: string;
  mobileNumber: string;
  deviceId: string;
  referCode: string;
  coins: number;
  walletBalance: number;
  referredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  message: string;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      totalCoins: number;
      totalWalletBalance: number;
    };
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Get Users API
export const getUsers = async (params?: GetUsersParams): Promise<UsersResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const url = `${BASE_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// User Details Interfaces
export interface UserWithdrawalRequest {
  requestId: string;
  amount: number;
  paymentMethod: 'UPI' | 'BankTransfer';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface UserStatistics {
  referralCount: number;
  totalWithdrawalRequests: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  rejectedWithdrawals: number;
  totalWithdrawn: number;
  totalAppSubmissions: number;
  approvedAppSubmissions: number;
  pendingAppSubmissions: number;
  rejectedAppSubmissions: number;
  totalEarningsFromApps: number;
}

export interface UserDetails {
  userId: string;
  mobileNumber: string;
  password?: string;
  deviceId: string;
  referCode: string;
  coins: number;
  walletBalance: number;
  referredBy: string | null;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  signupTime?: string;
  lastLoginTime?: string;
  statistics: UserStatistics;
  withdrawalRequests: UserWithdrawalRequest[];
  appSubmissions?: AppSubmission[];
}

export interface UserDetailsResponse {
  message: string;
  data: UserDetails;
}

// Get User Details by ID API
export const getUserById = async (userId: string): Promise<UserDetailsResponse> => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update User Interfaces
export interface UpdateUserRequest {
  MobileNumber?: string;
  Password?: string;
  DeviceId?: string;
  Coins?: number;
  WalletBalance?: number;
}

export interface UserUpdateChanges {
  mobileNumber?: { from: string; to: string };
  deviceId?: { from: string; to: string };
  coins?: { from: number; to: number };
  walletBalance?: { from: number; to: number };
  password?: string;
}

export interface UpdateUserResponse {
  message: string;
  data: {
    userId: string;
    mobileNumber: string;
    password?: string;
    deviceId: string;
    referCode: string;
    coins: number;
    walletBalance: number;
    referredBy: string | null;
    createdAt: string;
    updatedAt: string;
    changes: UserUpdateChanges;
    statistics: {
      referralCount: number;
      totalWithdrawalRequests: number;
    };
  };
}

// Update User API
export const updateUser = async (userId: string, data: UpdateUserRequest): Promise<UpdateUserResponse> => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Block User Interfaces
export interface BlockUserRequest {
  reason?: string;
}

export interface BlockUserResponse {
  message: string;
  data: {
    userId: string;
    mobileNumber: string;
    isBlocked: boolean;
    blockedAt: string;
    blockedReason?: string | null;
  };
}

export interface UnblockUserResponse {
  message: string;
  data: {
    userId: string;
    mobileNumber: string;
    isBlocked: boolean;
    blockedAt: null;
    blockedReason: null;
  };
}

// Block User API
export const blockUser = async (userId: string, data?: BlockUserRequest): Promise<BlockUserResponse> => {
  const response = await fetch(`${BASE_URL}/users/${userId}/block`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleApiResponse(response);
};

// Unblock User API
export const unblockUser = async (userId: string): Promise<UnblockUserResponse> => {
  const response = await fetch(`${BASE_URL}/users/${userId}/unblock`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// App Installation Interfaces
export interface App {
  appId?: string;
  _id?: string;
  appName?: string;
  AppName?: string;
  appImage?: string;
  AppImage?: string;
  appDownloadUrl?: string;
  AppDownloadUrl?: string;
  rewardCoins?: number;
  RewardCoins?: number;
  difficulty?: string;
  Difficulty?: string;
  status?: string;
  Status?: string;
  description?: string;
  Description?: string;
  statistics?: {
    totalSubmissions: number;
    approvedSubmissions: number;
    pendingSubmissions: number;
    rejectedSubmissions?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppRequest {
  AppName: string;
  AppImage: string;
  AppDownloadUrl: string;
  RewardCoins: number;
  Difficulty?: 'Easiest' | 'Easy' | 'Medium' | 'Hard';
  Status?: 'Active' | 'Inactive';
  Description?: string;
}

export interface UpdateAppRequest {
  AppName?: string;
  AppImage?: string;
  AppDownloadUrl?: string;
  RewardCoins?: number;
  Difficulty?: 'Easiest' | 'Easy' | 'Medium' | 'Hard';
  Status?: 'Active' | 'Inactive';
  Description?: string;
}

export interface AppsResponse {
  message: string;
  data: {
    apps: App[];
    totalApps: number;
  };
}

export interface AppResponse {
  message: string;
  data: App;
}

export interface AppSubmission {
  submissionId: string;
  userId: string;
  userMobileNumber: string;
  userDeviceId: string;
  userReferCode: string;
  appId: string;
  appName: string;
  appImage: string;
  appRewardCoins: number;
  appDifficulty: string;
  screenshotUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSubmissionsResponse {
  message: string;
  data: {
    submissions: AppSubmission[];
    totalSubmissions: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

export interface UpdateSubmissionStatusRequest {
  status: 'Approved' | 'Rejected';
  adminNotes?: string;
}

export interface UpdateSubmissionStatusResponse {
  message: string;
  data: {
    submissionId: string;
    appName: string;
    rewardCoins: number;
    status: string;
    adminNotes?: string | null;
    userCoins: number;
    updatedAt: string;
  };
}

export interface GetAppsParams {
  status?: 'Active' | 'Inactive';
  difficulty?: 'Easiest' | 'Easy' | 'Medium' | 'Hard';
  sortBy?: 'reward';
}

export interface GetSubmissionsParams {
  status?: 'Pending' | 'Approved' | 'Rejected';
  appId?: string;
  userId?: string;
  sortBy?: 'oldest';
}

// Create App API
export const createApp = async (data: CreateAppRequest): Promise<AppResponse> => {
  const response = await fetch(`${BASE_URL}/apps`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Apps API
export const getApps = async (params?: GetAppsParams): Promise<AppsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

  const url = `${BASE_URL}/apps${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Get App by ID API
export const getAppById = async (appId: string): Promise<AppResponse> => {
  const response = await fetch(`${BASE_URL}/apps/${appId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update App API
export const updateApp = async (appId: string, data: UpdateAppRequest): Promise<AppResponse> => {
  const response = await fetch(`${BASE_URL}/apps/${appId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Delete App API
export const deleteApp = async (appId: string): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/apps/${appId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Get App Submissions API
export const getAppSubmissions = async (params?: GetSubmissionsParams): Promise<AppSubmissionsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.appId) queryParams.append('appId', params.appId);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

  const url = `${BASE_URL}/apps/submissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update Submission Status API
export const updateSubmissionStatus = async (
  submissionId: string,
  data: UpdateSubmissionStatusRequest
): Promise<UpdateSubmissionStatusResponse> => {
  const response = await fetch(`${BASE_URL}/apps/submissions/${submissionId}/status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

export interface BulkSubmissionStatusRequest {
  submissionIds: string[];
  status: 'Approved' | 'Rejected';
  adminNotes?: string;
}

export interface BulkWithdrawalStatusRequest {
  requestIds: string[];
  status: 'Approved' | 'Rejected';
  adminNotes?: string;
}

export interface BulkActionResponse {
  message: string;
  data?: {
    matchedCount?: number;
    modifiedCount?: number;
    processedCount?: number;
    failedCount?: number;
    [key: string]: any;
  };
}

export interface DeleteAppSubmissionParams {
  allowApprovedDelete?: boolean;
  revertReward?: boolean;
}

export interface UserActivityEvent {
  _id?: string;
  type: string;
  coinsDelta?: number;
  walletDelta?: number;
  amount?: number;
  status?: string;
  note?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserActivitySummary {
  totalEvents: number;
  totalCoinsDelta: number;
  totalWalletDelta: number;
}

export interface UserActivityUser {
  _id: string;
  UserName?: string;
  MobileNumber?: string;
  ReferCode?: string;
  Coins?: number;
  WalletBalance?: number;
}

export interface UserActivityResponse {
  message: string;
  data: {
    user: UserActivityUser;
    events: UserActivityEvent[];
    summary: UserActivitySummary;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEvents: number;
      limit: number;
    };
  };
}

export interface GetUserActivityParams {
  page?: number;
  limit?: number;
  type?: string;
}

export type TaskControlType =
  | 'Captcha'
  | 'DailySpin'
  | 'ScratchCardDailyLimit'
  | 'AppInstall'
  | 'Quiz';

export interface TaskControl {
  _id?: string;
  /** Backend may send PascalCase */
  TaskType?: TaskControlType;
  taskType?: TaskControlType;
  IsActive?: boolean;
  MinRequiredBuildNumber?: number;
  LatestVersion?: string;
  ForceUpdate?: boolean;
  AdsEnabled?: boolean;
  DailyLimit?: number | null;
  CoinsPerTask?: number | null;
  [key: string]: unknown;
}

export interface TaskControlsResponse {
  message: string;
  data:
    | { controls: TaskControl[] }
    | Partial<Record<TaskControlType, TaskControl | Record<string, unknown>>>
    | TaskControl[];
}

export interface UpdateTaskControlRequest {
  IsActive?: boolean;
  AdsEnabled?: boolean;
  DailyLimit?: number | null;
  CoinsPerTask?: number;
}

export interface TaskControlResponse {
  message: string;
  data: TaskControl;
}

/** Display / save order — Quiz first for admin UX. */
export const TASK_CONTROL_TYPE_ORDER: TaskControlType[] = [
  'Quiz',
  'Captcha',
  'DailySpin',
  'ScratchCardDailyLimit',
  'AppInstall',
];

const taskControlTypeFromRow = (row: unknown): TaskControlType | null => {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const t = (r.taskType ?? r.TaskType ?? r.task_type ?? r.type) as string | undefined;
  if (t && TASK_CONTROL_TYPE_ORDER.includes(t as TaskControlType)) {
    return t as TaskControlType;
  }
  return null;
};

const pickFirstDefined = (...vals: unknown[]): unknown =>
  vals.find((v) => v !== undefined);

/** Map API rows (camelCase / snake_case) onto fields the admin form reads (PascalCase). */
const mergeTaskControlIntoSlot = (
  slot: TaskControl,
  row: unknown
): TaskControl => {
  if (!row || typeof row !== 'object') return slot;
  const r = row as Record<string, unknown>;

  const isActive = pickFirstDefined(r.IsActive, r.isActive);
  const adsEnabled = pickFirstDefined(r.AdsEnabled, r.adsEnabled);
  const dailyLimit = pickFirstDefined(r.DailyLimit, r.dailyLimit, r.daily_limit);
  const coinsPerTask = pickFirstDefined(r.CoinsPerTask, r.coinsPerTask, r.coins_per_task);

  const merged: TaskControl = {
    ...slot,
    ...(row as TaskControl),
    taskType: slot.taskType,
  };

  if (isActive !== undefined) merged.IsActive = Boolean(isActive);
  if (adsEnabled !== undefined) merged.AdsEnabled = Boolean(adsEnabled);
  if (dailyLimit !== undefined) {
    merged.DailyLimit = dailyLimit === null ? null : (Number(dailyLimit) as number);
  }
  if (coinsPerTask !== undefined) {
    merged.CoinsPerTask = coinsPerTask === null ? null : (Number(coinsPerTask) as number);
  }

  return merged;
};

/** Find task-control rows whether `data` is an array or nested `{ controls | taskControls | data }. */
const extractTaskControlRowArray = (raw: unknown): TaskControl[] | null => {
  if (raw === undefined || raw === null) return null;
  if (Array.isArray(raw)) return raw as TaskControl[];

  if (typeof raw !== 'object') return null;

  const tryKeys = (o: Record<string, unknown>): TaskControl[] | null => {
    for (const k of ['controls', 'taskControls', 'items']) {
      const a = o[k];
      if (Array.isArray(a)) return a as TaskControl[];
    }
    return null;
  };

  const o = raw as Record<string, unknown>;
  const direct = tryKeys(o);
  if (direct) return direct;

  const inner = o.data;
  if (inner !== undefined && inner !== raw) {
    if (Array.isArray(inner)) return inner as TaskControl[];
    if (typeof inner === 'object' && inner !== null) {
      const nested = tryKeys(inner as Record<string, unknown>);
      if (nested) return nested;
      const deep = (inner as Record<string, unknown>).data;
      if (Array.isArray(deep)) return deep as TaskControl[];
    }
  }

  return null;
};

/** Normalize GET /task-controls payload (array, { controls: [] }, or keyed object). */
export const normalizeTaskControlsData = (
  raw: TaskControlsResponse['data'] | undefined
): Record<TaskControlType, TaskControl> => {
  const initial = (): Record<TaskControlType, TaskControl> =>
    TASK_CONTROL_TYPE_ORDER.reduce((acc, key) => {
      acc[key] = { taskType: key };
      return acc;
    }, {} as Record<TaskControlType, TaskControl>);

  if (raw === undefined || raw === null) return initial();

  const rows = extractTaskControlRowArray(raw);
  if (rows) {
    const acc = initial();
    for (const row of rows) {
      const t = taskControlTypeFromRow(row);
      if (t) acc[t] = mergeTaskControlIntoSlot(acc[t], row);
    }
    return acc;
  }

  if (typeof raw !== 'object') return initial();

  const acc = initial();
  const rawRec = raw as Record<string, unknown>;
  for (const key of TASK_CONTROL_TYPE_ORDER) {
    const block =
      rawRec[key] ?? rawRec[key.toLowerCase() as keyof typeof rawRec];
    if (block && typeof block === 'object' && !Array.isArray(block)) {
      acc[key] = mergeTaskControlIntoSlot(
        {
          ...acc[key],
          taskType: key,
        },
        block
      );
    }
  }
  return acc;
};

// Get User Activity API
export const getUserActivity = async (userId: string, params?: GetUserActivityParams): Promise<UserActivityResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type) queryParams.append('type', params.type);

  const url = `${BASE_URL}/users/${userId}/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Get Task Controls API
export const getTaskControls = async (): Promise<TaskControlsResponse> => {
  const response = await fetch(`${BASE_URL}/task-controls`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update Task Control API
export const updateTaskControl = async (
  taskType: TaskControlType,
  data: UpdateTaskControlRequest
): Promise<TaskControlResponse> => {
  const response = await fetch(`${BASE_URL}/task-controls/${taskType}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Bulk Update App Submission Status API
export const bulkUpdateSubmissionStatus = async (data: BulkSubmissionStatusRequest): Promise<BulkActionResponse> => {
  const response = await fetch(`${BASE_URL}/apps/submissions/bulk-status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Bulk Update Withdrawal Request Status API
export const bulkUpdateWithdrawalStatus = async (data: BulkWithdrawalStatusRequest): Promise<BulkActionResponse> => {
  const response = await fetch(`${BASE_URL}/withdrawal/requests/bulk-status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Delete App Submission API
export const deleteAppSubmission = async (
  submissionId: string,
  params?: DeleteAppSubmissionParams
): Promise<{ message: string }> => {
  const queryParams = new URLSearchParams();
  if (typeof params?.allowApprovedDelete === 'boolean') {
    queryParams.append('allowApprovedDelete', params.allowApprovedDelete ? 'true' : 'false');
  }
  if (typeof params?.revertReward === 'boolean') {
    queryParams.append('revertReward', params.revertReward ? 'true' : 'false');
  }

  const url = `${BASE_URL}/apps/submissions/${submissionId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Coin Conversion Settings Interfaces
export interface CoinConversionSettingsRequest {
  CoinsPerRupee: number;
  MinimumCoinsToConvert: number;
}

export interface CoinConversionSettingsResponse {
  message: string;
  data: {
    _id: string;
    CoinsPerRupee: number;
    MinimumCoinsToConvert: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

// Set Coin Conversion Settings API
export const setCoinConversionSettings = async (data: CoinConversionSettingsRequest): Promise<CoinConversionSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/coinconversion/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Coin Conversion Settings API
export const getCoinConversionSettings = async (): Promise<CoinConversionSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/coinconversion/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Scratch Card Settings Interfaces
export interface ScratchCardSettingsRequest {
  Sunday: number;
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  RewardType: 'Coins' | 'WalletBalance';
}

export interface ScratchCardSettingsResponse {
  message: string;
  data: {
    _id: string;
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    RewardType: 'Coins' | 'WalletBalance';
    createdAt?: string;
    updatedAt?: string;
  };
}

// Set Scratch Card Settings API
export const setScratchCardSettings = async (data: ScratchCardSettingsRequest): Promise<ScratchCardSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/scratchcard/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Scratch Card Settings API
export const getScratchCardSettings = async (): Promise<ScratchCardSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/scratchcard/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Signup Bonus Settings Interfaces
export interface SignupBonusSettingsRequest {
  SignupBonusAmount: number;
  RewardType: 'Coins' | 'WalletBalance';
}

export interface SignupBonusSettingsResponse {
  message: string;
  data: {
    _id: string;
    SignupBonusAmount: number;
    RewardType: 'Coins' | 'WalletBalance';
    createdAt?: string;
    updatedAt?: string;
  };
}

// Set Signup Bonus Settings API
export const setSignupBonusSettings = async (data: SignupBonusSettingsRequest): Promise<SignupBonusSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/signupbonus/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Signup Bonus Settings API
export const getSignupBonusSettings = async (): Promise<SignupBonusSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/signupbonus/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Scratch Card Daily Limit Settings Interfaces
export interface ScratchCardDailyLimitSettingsRequest {
  DailyLimit?: number;
  RewardAmount?: number;
  RewardCoins?: number;
  IsActive?: boolean;
}

export interface ScratchCardDailyLimitSettingsResponse {
  message: string;
  data: {
    _id: string;
    DailyLimit: number;
    RewardAmount: number;
    RewardCoins: number;
    IsActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
}

// Set Scratch Card Daily Limit Settings API
export const setScratchCardDailyLimitSettings = async (data: ScratchCardDailyLimitSettingsRequest): Promise<ScratchCardDailyLimitSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/scratchcard/dailylimit/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Scratch Card Daily Limit Settings API
export const getScratchCardDailyLimitSettings = async (): Promise<ScratchCardDailyLimitSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/scratchcard/dailylimit/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Social links (admin)
export interface SocialLinksData {
  _id: string;
  TelegramLink?: string | null;
  YouTubeLink?: string | null;
  InstagramLink?: string | null;
  IsActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialLinksResponse {
  message: string;
  data: SocialLinksData;
}

/** All fields optional; omit unchanged. Use `null` or `""` to clear a link. */
export interface SocialLinksUpdateRequest {
  TelegramLink?: string | null;
  YouTubeLink?: string | null;
  InstagramLink?: string | null;
  IsActive?: boolean;
}

export const getSocialLinks = async (): Promise<SocialLinksResponse> => {
  const response = await fetch(`${BASE_URL}/social-links`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

export const updateSocialLinks = async (data: SocialLinksUpdateRequest): Promise<SocialLinksResponse> => {
  const response = await fetch(`${BASE_URL}/social-links`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
};

// Withdrawal Threshold Settings Interfaces
export interface WithdrawalThresholdRequest {
  MinimumWithdrawalAmount: number;
  DailyWithdrawalRequestLimit?: number;
  WithdrawalDenominations?: number[];
}

export interface WithdrawalThresholdResponse {
  message: string;
  data: {
    MinimumWithdrawalAmount: number;
    DailyWithdrawalRequestLimit?: number;
    WithdrawalDenominations?: number[];
    updatedAt?: string;
  };
}

// Set Withdrawal Threshold API
export const setWithdrawalThreshold = async (data: WithdrawalThresholdRequest): Promise<WithdrawalThresholdResponse> => {
  const response = await fetch(`${BASE_URL}/withdrawal/threshold`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Withdrawal Threshold API
export const getWithdrawalThreshold = async (): Promise<WithdrawalThresholdResponse> => {
  const response = await fetch(`${BASE_URL}/withdrawal/threshold`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Dashboard Statistics Interfaces
export interface DashboardStatistics {
  users: {
    totalUsers: number;
    todayRegistrations: number;
    recentRegistrations: number;
  };
  wallet: {
    totalWalletBalance: number;
    totalCoins: number;
  };
  withdrawals: {
    totalWithdrawals: number;
    statistics: {
      pending: { count: number; totalAmount: number };
      approved: { count: number; totalAmount: number };
      rejected: { count: number; totalAmount: number };
    };
  };
  registrationChart: {
    days: number;
    data: Array<{
      date: string;
      registrations: number;
    }>;
  };
  requestedSummary?: {
    users: {
      today: number;
      yesterday: number;
      sevenDays: number;
      thisMonth: number;
      lastMonth: number;
      total: number;
    };
    withdrawals: {
      today: number;
      yesterday: number;
      thisMonth: number;
    };
  };
}

export interface DashboardResponse {
  message: string;
  data: DashboardStatistics;
}

// Get Dashboard Statistics API
export const getDashboardStatistics = async (days: number = 30): Promise<DashboardResponse> => {
  const response = await fetch(`${BASE_URL}/dashboard?days=${days}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Commission Slab Interfaces
export interface CommissionSlab {
  _id: string;
  SlabName: string;
  MinEarnings: number;
  MaxEarnings: number | null;
  CommissionPercentage: number;
  RewardType: 'Coins' | 'WalletBalance';
  IsActive: boolean;
  Order: number;
  CommissionBasedOn: 'ReferredUserWalletBalance' | 'WithdrawalRequestAmount' | 'WithdrawalRequestTime';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommissionSlabRequest {
  SlabName: string;
  MinEarnings: number;
  MaxEarnings?: number | null;
  CommissionPercentage: number;
  RewardType?: 'Coins' | 'WalletBalance';
  IsActive?: boolean;
  Order?: number;
  CommissionBasedOn?: 'ReferredUserWalletBalance' | 'WithdrawalRequestAmount' | 'WithdrawalRequestTime';
}

export interface UpdateCommissionSlabRequest {
  SlabName?: string;
  MinEarnings?: number;
  MaxEarnings?: number | null;
  CommissionPercentage?: number;
  RewardType?: 'Coins' | 'WalletBalance';
  IsActive?: boolean;
  Order?: number;
  CommissionBasedOn?: 'ReferredUserWalletBalance' | 'WithdrawalRequestAmount' | 'WithdrawalRequestTime';
}

export interface CommissionSlabsResponse {
  message: string;
  data: {
    slabs: CommissionSlab[];
    totalSlabs: number;
    activeSlabs: number;
  };
}

export interface CommissionSlabResponse {
  message: string;
  data: CommissionSlab;
}

// Create Commission Slab API
export const createCommissionSlab = async (data: CreateCommissionSlabRequest): Promise<CommissionSlabResponse> => {
  const response = await fetch(`${BASE_URL}/commission/slabs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Commission Slabs API
export const getCommissionSlabs = async (): Promise<CommissionSlabsResponse> => {
  const response = await fetch(`${BASE_URL}/commission/slabs`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update Commission Slab API
export const updateCommissionSlab = async (
  slabId: string,
  data: UpdateCommissionSlabRequest
): Promise<CommissionSlabResponse> => {
  const response = await fetch(`${BASE_URL}/commission/slabs/${slabId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Delete Commission Slab API
export const deleteCommissionSlab = async (slabId: string): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/commission/slabs/${slabId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Users Earnings Interfaces
export interface UserEarning {
  userId: string;
  userName?: string;
  mobileNumber: string;
  referCode: string;
  coins: number;
  walletBalance: number;
  totalEarnings: number;
  earningsBreakdown: {
    coins: number;
    walletBalance: number;
    appInstallations: number;
    scratchCards: number;
    captcha: number;
    dailyBonus: number;
    referralEarnings: number;
  };
  referralCount: number;
  referredBy: string | null;
  signupTime?: string;
  lastLoginTime?: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersEarningsResponse {
  message: string;
  data: {
    users: UserEarning[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      totalCoins: number;
      totalWalletBalance: number;
      totalEarnings: number;
      totalReferrals: number;
    };
  };
}

export interface GetUsersEarningsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'totalEarnings' | 'coins' | 'walletBalance' | 'referralCount';
}

// Get Users Earnings API
export const getUsersEarnings = async (params?: GetUsersEarningsParams): Promise<UsersEarningsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

  const url = `${BASE_URL}/users/earnings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Sponsor Promotion Interfaces
export interface SponsorPromotionSubmission {
  submissionId: string;
  userId: string;
  userName: string;
  userMobileNumber: string;
  userReferCode: string;
  sponsorName: string;
  mobileNumber: string;
  email: string;
  appPromotion: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorPromotionsResponse {
  message: string;
  data: {
    submissions: SponsorPromotionSubmission[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalSubmissions: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };
}

export interface UpdateSponsorPromotionStatusRequest {
  status: 'Approved' | 'Rejected';
  adminNotes?: string;
}

export interface UpdateSponsorPromotionStatusResponse {
  message: string;
  data: {
    submissionId: string;
    sponsorName: string;
    mobileNumber: string;
    email: string;
    appPromotion: string;
    status: string;
    adminNotes?: string | null;
    userName: string;
    userMobileNumber: string;
    updatedAt: string;
  };
}

export interface GetSponsorPromotionsParams {
  status?: 'Pending' | 'Approved' | 'Rejected';
  userId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// Get Sponsor Promotions API
export const getSponsorPromotions = async (params?: GetSponsorPromotionsParams): Promise<SponsorPromotionsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const url = `${BASE_URL}/sponsor/promotions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update Sponsor Promotion Status API
export const updateSponsorPromotionStatus = async (
  submissionId: string,
  data: UpdateSponsorPromotionStatusRequest
): Promise<UpdateSponsorPromotionStatusResponse> => {
  const response = await fetch(`${BASE_URL}/sponsor/promotions/${submissionId}/status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Cron Jobs Interfaces
export interface CronJob {
  scheduled: boolean;
  schedule: string;
  description: string;
}

export interface CronJobsStatusResponse {
  message: string;
  data: {
    dailyResetJob: CronJob;
    cleanupOldRecordsJob: CronJob;
    note: string;
  };
}

export interface DailyResetStatistics {
  scratchCard: {
    today: number;
    yesterday: number;
  };
  dailySpin: {
    today: number;
    yesterday: number;
  };
  captcha: {
    today: number;
    yesterday: number;
  };
}

export interface DailyResetStatusResponse {
  message: string;
  data: {
    resetTime: string;
    today: string;
    yesterday: string;
    statistics: DailyResetStatistics;
    note: string;
  };
}

// Get Cron Jobs Status API
export const getCronJobsStatus = async (): Promise<CronJobsStatusResponse> => {
  const response = await fetch(`${BASE_URL}/cron/status`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Get Daily Reset Status API
export const getDailyResetStatus = async (): Promise<DailyResetStatusResponse> => {
  const response = await fetch(`${BASE_URL}/cron/daily-reset`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Support Link Interfaces
export interface SupportLinkSettings {
  _id?: string;
  SupportLink: string;
  SupportEmail?: string | null;
  SupportPhone?: string | null;
  SupportWhatsApp?: string | null;
  IsActive: boolean;
  Description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupportLinkRequest {
  SupportLink: string;
  SupportEmail?: string | null;
  SupportPhone?: string | null;
  SupportWhatsApp?: string | null;
  IsActive?: boolean;
  Description?: string | null;
}

export interface UpdateSupportLinkRequest {
  SupportLink?: string;
  SupportEmail?: string | null;
  SupportPhone?: string | null;
  SupportWhatsApp?: string | null;
  IsActive?: boolean;
  Description?: string | null;
}

export interface SupportLinkResponse {
  message: string;
  data: SupportLinkSettings;
}

// Create/Set Support Link API
export const setSupportLink = async (data: CreateSupportLinkRequest): Promise<SupportLinkResponse> => {
  const response = await fetch(`${BASE_URL}/support/link`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Get Support Link API
export const getSupportLink = async (): Promise<SupportLinkResponse> => {
  const response = await fetch(`${BASE_URL}/support/link`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update Support Link API
export const updateSupportLink = async (data: UpdateSupportLinkRequest): Promise<SupportLinkResponse> => {
  const response = await fetch(`${BASE_URL}/support/link`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Ads Settings Interfaces
export type AdsTaskType = 'Quiz' | 'Captcha' | 'DailySpin' | 'ScratchCard' | 'ScratchCardDailyLimit' | 'AppInstall';

export interface AdsTaskRule {
  TaskType: AdsTaskType;
  IsActive?: boolean;
  BannerEnabled?: boolean;
  RewardedEnabled?: boolean;
  InterstitialEnabled?: boolean;
  InterstitialAfterCount?: number;
  RewardedAfterCount?: number;
}

export interface AdsSettings {
  GlobalAdsEnabled: boolean;
  BannerAdsEnabled: boolean;
  RewardedAdsEnabled: boolean;
  InterstitialAdsEnabled: boolean;
  TaskRules: AdsTaskRule[];
}

export interface AdsSettingsResponse {
  message: string;
  data: AdsSettings;
}

export interface UpdateAdsSettingsRequest {
  GlobalAdsEnabled?: boolean;
  BannerAdsEnabled?: boolean;
  RewardedAdsEnabled?: boolean;
  InterstitialAdsEnabled?: boolean;
  TaskRules?: AdsTaskRule[];
}

export interface UpdateTaskAdsSettingsRequest {
  IsActive?: boolean;
  BannerEnabled?: boolean;
  RewardedEnabled?: boolean;
  InterstitialEnabled?: boolean;
  InterstitialAfterCount?: number;
  RewardedAfterCount?: number;
}

// Get Ads Settings API
export const getAdsSettings = async (): Promise<AdsSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/ads/settings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Update Full Ads Settings API
export const updateAdsSettings = async (data: UpdateAdsSettingsRequest): Promise<AdsSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/ads/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// Update Task-wise Ads Settings API
export const updateTaskAdsSettings = async (
  taskType: AdsTaskType,
  data: UpdateTaskAdsSettingsRequest
): Promise<AdsSettingsResponse> => {
  const response = await fetch(`${BASE_URL}/ads/settings/task/${taskType}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
};

// --- Popup template (GET/POST/PUT /admin/popup-template) ---
// Stored fields: Title, Description, IsActive. GET merges legacy Body into Description for display until saved with Description.
// Legacy image/action fields are ignored by the API if sent.

export interface PopupTemplate {
  _id?: string;
  Title?: string;
  /** Main popup copy */
  Description?: string;
  /** Legacy; omitted from saves in favour of Description */
  Body?: string;
  IsActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PopupTemplateResponse {
  message: string;
  /** Present when nothing saved yet — e.g. "No popup template saved yet" */
  note?: string;
  data: PopupTemplate | null;
}

/** POST/PUT JSON body. Omit `Body` when sending `Description`; `Body` is an alias only if `Description` is omitted. */
export interface PopupTemplateJsonBody {
  Title?: string;
  Description?: string;
  Body?: string;
  IsActive?: boolean | 'true' | 'false';
}

export const getPopupTemplate = async (): Promise<PopupTemplateResponse> => {
  const response = await fetch(`${BASE_URL}/popup-template`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

export const postPopupTemplate = async (body: PopupTemplateJsonBody): Promise<PopupTemplateResponse> => {
  const response = await fetch(`${BASE_URL}/popup-template`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleApiResponse(response);
};

export const putPopupTemplate = async (body: PopupTemplateJsonBody): Promise<PopupTemplateResponse> => {
  const response = await fetch(`${BASE_URL}/popup-template`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleApiResponse(response);
};
