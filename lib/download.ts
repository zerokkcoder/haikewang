import { Resource, User } from './mock-data';

export interface DownloadResult {
  success: boolean;
  message: string;
  transactionId?: string;
  remainingDownloads?: number;
}

export interface DownloadRestrictions {
  canDownload: boolean;
  reason?: string;
  requiresPayment?: boolean;
  requiresVip?: boolean;
  price?: number;
  remainingDownloads?: number;
  maxDownloads?: number;
}

/**
 * Check if user can download a resource based on membership rules
 */
export function checkDownloadRestrictions(resource: Resource, user: User | null): DownloadRestrictions {
  // Not logged in
  if (!user) {
    return {
      canDownload: false,
      reason: '请先登录',
      requiresPayment: false,
      requiresVip: false
    };
  }

  // VIP-only resource check
  if (resource.isVipOnly && !user.isVip) {
    return {
      canDownload: false,
      reason: '此资源为VIP专享',
      requiresVip: true,
      requiresPayment: false
    };
  }

  // Paid resource check for non-VIP users
  if (resource.price > 0 && !user.isVip) {
    return {
      canDownload: false,
      reason: '此资源需要付费下载',
      requiresPayment: true,
      requiresVip: false,
      price: resource.price
    };
  }

  // VIP daily download limit check（优先使用用户上的 vipDailyLimit 字段）
  if (user.isVip) {
    const vipDailyLimit = typeof user.vipDailyLimit === 'number' && user.vipDailyLimit > 0 ? user.vipDailyLimit : 20;
    if (user.dailyDownloadCount >= vipDailyLimit) {
      return {
        canDownload: false,
        reason: '今日下载次数已达上限',
        requiresPayment: false,
        requiresVip: false,
        remainingDownloads: 0,
        maxDownloads: vipDailyLimit
      };
    }
  }

  // Resource-specific VIP daily limit
  if (user.isVip && resource.vipDailyLimit) {
    // This would need to be tracked per resource per day
    // For now, we'll use a simplified check
    if (user.dailyDownloadCount >= (resource.vipDailyLimit * 2)) { // Allow some flexibility
      return {
        canDownload: false,
        reason: '该资源今日下载次数已达上限',
        requiresPayment: false,
        requiresVip: false,
        remainingDownloads: 0,
        maxDownloads: resource.vipDailyLimit
      };
    }
  }

  // All checks passed
  const vipDailyLimit = user.isVip && typeof user.vipDailyLimit === 'number' && user.vipDailyLimit > 0 ? user.vipDailyLimit : 20
  const remainingDownloads = user.isVip ? 
    vipDailyLimit - user.dailyDownloadCount : 
    1

  return {
    canDownload: true,
    reason: undefined,
    requiresPayment: false,
    requiresVip: false,
    remainingDownloads: Math.max(0, remainingDownloads),
    maxDownloads: user.isVip ? vipDailyLimit : 1
  };
}

/**
 * Process a download request
 */
export async function processDownload(
  resource: Resource, 
  user: User | null
): Promise<DownloadResult> {
  const restrictions = checkDownloadRestrictions(resource, user);

  if (!restrictions.canDownload) {
    return {
      success: false,
      message: restrictions.reason || '下载失败',
      remainingDownloads: restrictions.remainingDownloads
    };
  }

  // Simulate download processing
  try {
    // In a real implementation, this would:
    // 1. Generate a secure download URL
    // 2. Update user download count
    // 3. Log the download activity
    // 4. Process payment if required

    const transactionId = `DL${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      message: '下载开始',
      transactionId,
      remainingDownloads: restrictions.remainingDownloads ? restrictions.remainingDownloads - 1 : 0
    };
  } catch (error) {
    return {
      success: false,
      message: '下载处理失败，请重试',
      remainingDownloads: restrictions.remainingDownloads
    };
  }
}

/**
 * Get download quota information for a user
 */
export function getUserDownloadQuota(user: User | null): {
  dailyUsed: number;
  dailyLimit: number;
  isUnlimited: boolean;
  canDownload: boolean;
} {
  if (!user) {
    return {
      dailyUsed: 0,
      dailyLimit: 0,
      isUnlimited: false,
      canDownload: false
    };
  }

  if (user.isVip) {
    const vipDailyLimit = typeof user.vipDailyLimit === 'number' && user.vipDailyLimit > 0 ? user.vipDailyLimit : 20
    return {
      dailyUsed: user.dailyDownloadCount,
      dailyLimit: vipDailyLimit,
      isUnlimited: false,
      canDownload: user.dailyDownloadCount < vipDailyLimit
    };
  }

  // Non-VIP users
  return {
    dailyUsed: user.dailyDownloadCount,
    dailyLimit: 1, // 1 free download per day for non-VIP
    isUnlimited: false,
    canDownload: user.dailyDownloadCount < 1
  };
}

/**
 * Check if user should be redirected to login
 */
export function shouldRedirectToLogin(user: User | null): boolean {
  return !user;
}

/**
 * Check if user should be redirected to VIP page
 */
export function shouldRedirectToVip(resource: Resource, user: User | null): boolean {
  if (!user) return false;
  return resource.isVipOnly && !user.isVip;
}

/**
 * Check if payment is required for download
 */
export function isPaymentRequired(resource: Resource, user: User | null): boolean {
  if (!user) return false;
  return resource.price > 0 && !user.isVip;
}