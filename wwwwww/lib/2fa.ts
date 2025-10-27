import crypto from 'crypto';
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';
import { prisma } from './prisma';

/**
 * Generate backup codes for 2FA recovery
 */
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

/**
 * Setup 2FA for a user
 */
export async function setup2FA(userId: string) {
  try {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Pigeon Auction (${userId})`,
      issuer: 'Pigeon Auction Platform',
    });

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Save to database
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        backupCodes: JSON.stringify(backupCodes),
        is2FAEnabled: false, // Will be enabled after verification
      },
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
    };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return {
      success: false,
      error: 'Failed to setup 2FA',
    };
  }
}

/**
 * Verify 2FA token and enable 2FA
 */
export async function verifyAndEnable2FA(userId: string, token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, is2FAEnabled: true },
    });

    if (!user || !user.twoFactorSecret) {
      return {
        success: false,
        error: '2FA not set up for this user',
      };
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time windows (30 seconds each)
    });

    if (!verified) {
      return {
        success: false,
        error: 'Invalid 2FA token',
      };
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { is2FAEnabled: true },
    });

    return {
      success: true,
      message: '2FA has been enabled successfully',
    };
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return {
      success: false,
      error: 'Failed to verify 2FA token',
    };
  }
}

/**
 * Verify 2FA token during login
 */
export async function verify2FAToken(userId: string, token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        is2FAEnabled: true,
        backupCodes: true,
      },
    });

    if (!user || !user.is2FAEnabled || !user.twoFactorSecret) {
      return {
        success: false,
        error: '2FA not enabled for this user',
      };
    }

    // First try TOTP verification
    const totpVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (totpVerified) {
      return { success: true };
    }

    // If TOTP failed, try backup codes
    if (user.backupCodes) {
      const backupCodes = JSON.parse(user.backupCodes) as string[];
      const codeIndex = backupCodes.indexOf(token.toUpperCase());

      if (codeIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        await prisma.user.update({
          where: { id: userId },
          data: { backupCodes: JSON.stringify(backupCodes) },
        });

        return {
          success: true,
          usedBackupCode: true,
          remainingCodes: backupCodes.length,
        };
      }
    }

    return {
      success: false,
      error: 'Invalid 2FA token',
    };
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return {
      success: false,
      error: 'Failed to verify 2FA token',
    };
  }
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        is2FAEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
      },
    });

    return {
      success: true,
      message: '2FA has been disabled',
    };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return {
      success: false,
      error: 'Failed to disable 2FA',
    };
  }
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { is2FAEnabled: true },
    });

    if (!user || !user.is2FAEnabled) {
      return {
        success: false,
        error: '2FA must be enabled to regenerate backup codes',
      };
    }

    const backupCodes = generateBackupCodes();

    await prisma.user.update({
      where: { id: userId },
      data: { backupCodes: JSON.stringify(backupCodes) },
    });

    return {
      success: true,
      backupCodes,
      message: 'Backup codes have been regenerated',
    };
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return {
      success: false,
      error: 'Failed to regenerate backup codes',
    };
  }
}

/**
 * Get 2FA status for a user
 */
export async function get2FAStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        is2FAEnabled: true,
        backupCodes: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const backupCodes = user.backupCodes ? JSON.parse(user.backupCodes) : [];

    return {
      success: true,
      isEnabled: user.is2FAEnabled,
      backupCodesCount: backupCodes.length,
    };
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    return {
      success: false,
      error: 'Failed to get 2FA status',
    };
  }
}

/**
 * Check if user has 2FA enabled
 */
export async function has2FAEnabled(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { is2FAEnabled: true },
    });

    return user?.is2FAEnabled || false;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
}
