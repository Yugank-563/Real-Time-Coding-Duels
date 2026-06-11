import '../config/env.js';
import {
  TransactionalEmailsApi,
  AccountApi,
  TransactionalEmailsApiApiKeys,
  AccountApiApiKeys,
} from '@getbrevo/brevo';
import { getPremiumTemplate } from './otpTemplate.js';

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const accountInstance = new AccountApi();
accountInstance.setApiKey(AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY);


const sender = {
  name: 'BattleCode Arena',
  email: process.env.BREVO_SENDER_EMAIL,
};

export const sendOTPEmail = async (email, otp, name = 'User') => {
  const firstName = name?.trim()?.split(' ')[0] || 'User';
  try {
    const htmlContent = getPremiumTemplate(
      otp,
      firstName,
      'Account Verification Key',
      'Deploy the security credentials key below to verify your email address and authorize your coding arena membership.',
      '#00f0ff' // Neon Cyan
    );

    const emailData = {
      sender,
      to: [{ email }],
      subject: '⚔️ [BattleCode] Account Verification Code',
      textContent: `Hi ${firstName}, your BattleCode verification code is: ${otp}`,
      htmlContent,
    };

    await apiInstance.sendTransacEmail(emailData);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, otp, name = 'User') => {
  const firstName = name?.trim()?.split(' ')[0] || 'User';
  try {
    const htmlContent = getPremiumTemplate(
      otp,
      firstName,
      'Password Reset Key',
      'A password recovery sequence was initialized. Apply the secure authorization code below to reset your password credentials.',
      '#9d00ff' // Neon Purple
    );

    const emailData = {
      sender,
      to: [{ email }],
      subject: '⚔️ [BattleCode] Password Reset Verification Code',
      textContent: `Hi ${firstName}, your BattleCode password reset verification code is: ${otp}`,
      htmlContent,
    };

    await apiInstance.sendTransacEmail(emailData);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};
