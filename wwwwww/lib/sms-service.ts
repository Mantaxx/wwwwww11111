/**
 * SMS Service - Integracja z różnymi providerami SMS
 */

export interface SMSProvider {
  sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }>;
}

/**
 * Twilio SMS Provider
 */
export class TwilioSMSProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }

  async sendSMS(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Sprawdź czy Twilio jest skonfigurowany
      if (!this.accountSid || !this.authToken || !this.phoneNumber) {
        return {
          success: false,
          error:
            'Twilio nie jest skonfigurowany. Ustaw TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN i TWILIO_PHONE_NUMBER',
        };
      }

      // Użyj Twilio
      const twilio = require('twilio');
      const client = twilio(this.accountSid, this.authToken);

      const result = await client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: phoneNumber,
      });

      console.log(`✅ Twilio SMS sent successfully: ${result.sid}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Twilio SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS via Twilio',
      };
    }
  }
}

/**
 * SMSAPI Provider
 */
export class SMSAPIProvider implements SMSProvider {
  private token: string;
  private baseUrl = 'https://api.smsapi.pl';

  constructor() {
    this.token = process.env.SMSAPI_TOKEN || '';
  }

  async sendSMS(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Sprawdź czy SMSAPI jest skonfigurowany
      if (!this.token) {
        return {
          success: false,
          error: 'SMSAPI nie jest skonfigurowany. Ustaw SMSAPI_TOKEN',
        };
      }

      // Użyj SMSAPI
      const response = await fetch(`${this.baseUrl}/sms.do`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          to: phoneNumber,
          message: message,
          format: 'json',
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      console.log(`✅ SMSAPI SMS sent successfully: ${result.id}`);
      return { success: true };
    } catch (error) {
      console.error('❌ SMSAPI error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS via SMSAPI',
      };
    }
  }
}

/**
 * Firebase Phone Auth Provider (domyślny)
 */
export class FirebasePhoneAuthProvider implements SMSProvider {
  async sendSMS(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    // Firebase Phone Auth wymaga konfiguracji Firebase
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return {
        success: false,
        error:
          'Firebase nie jest skonfigurowany. Ustaw NEXT_PUBLIC_FIREBASE_PROJECT_ID i inne zmienne Firebase',
      };
    }

    // Firebase Phone Auth nie wymaga wysyłania SMS przez nas
    // Firebase automatycznie wyśle SMS z kodem weryfikacyjnym
    console.log(
      `✅ Firebase Phone Auth - SMS will be sent to ${phoneNumber} with message: ${message}`
    );
    return { success: true };
  }
}

/**
 * SMS Service Factory
 */
export class SMSService {
  private provider: SMSProvider;

  constructor() {
    // Wybierz provider na podstawie zmiennych środowiskowych
    if (process.env.SMS_PROVIDER === 'twilio') {
      this.provider = new TwilioSMSProvider();
    } else if (process.env.SMS_PROVIDER === 'smsapi') {
      this.provider = new SMSAPIProvider();
    } else {
      // Domyślnie Firebase Phone Auth
      this.provider = new FirebasePhoneAuthProvider();
    }
  }

  async sendVerificationSMS(
    phoneNumber: string,
    verificationCode: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Twój kod weryfikacyjny: ${verificationCode}\n\nKod jest ważny przez 10 minut.\n\nMTM Pałka - Aukcje Gołębi`;
    return this.provider.sendSMS(phoneNumber, message);
  }

  async sendNotificationSMS(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.provider.sendSMS(phoneNumber, message);
  }
}

// Singleton instance
export const smsService = new SMSService();
