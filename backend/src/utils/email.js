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
  name: 'Coduelo Arena',
  email: process.env.BREVO_SENDER_EMAIL,
};

export const sendOTPEmail = async (email, otp, name = 'User') => {
  const firstName = name?.trim()?.split(' ')[0] || 'User';
  try {
    const htmlContent = getPremiumTemplate(
      otp,
      firstName,
      'Account Verification Key',
      'Enter this code to verify your identity and gain full access to your Coduelo account.',
      '#00f0ff' // Neon Cyan
    );

    const emailData = {
      sender,
      to: [{ email }],
      subject: 'Account Verification Code',
      textContent: `Hi ${firstName}, your Coduelo verification code is: ${otp}`,
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
      'A password reset was requested for your account. Use the code below to proceed.',
      '#9d00ff' // Neon Purple
    );

    const emailData = {
      sender,
      to: [{ email }],
      subject: 'Password Reset Verification Code',
      textContent: `Hi ${firstName}, your Coduelo password reset verification code is: ${otp}`,
      htmlContent,
    };

    await apiInstance.sendTransacEmail(emailData);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};