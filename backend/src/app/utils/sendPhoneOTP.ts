/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import twilio from 'twilio';
import config from '../config';
import throwAppError from './throwAppError';

const twilioClient = twilio(
  config.twilio_account_sid,
  config.twilio_auth_token,
);

export const sendPhoneOTP = async (
  phone: string,
  otp: string,
  purpose = 'account verification',
  expiresInMinutes = 10,
) => {
  const messageBody = `Your OTP for ${purpose} is: ${otp}. It expires in ${expiresInMinutes} minutes.`;

  try {
    const response = await twilioClient.messages.create({
      body: messageBody,
      from: config.twilio_phone_number,
      to: phone,
    });

    if (response.errorCode) {
      throwAppError(
        'sendPhoneOTP',
        `Failed to send SMS: ${response.errorMessage}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      message: `OTP sent to ${phone}`,
    };
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to send OTP via SMS:', error);
    }

    throwAppError(
      'sendPhoneOTP',
      `Failed to send SMS: ${error?.message || 'Unknown error'}`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
