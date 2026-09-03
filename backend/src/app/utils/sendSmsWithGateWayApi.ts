/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from '../config';
import throwAppError from './throwAppError';
import { StatusCodes } from 'http-status-codes';

export const sendSmsWithGateWayApi = async (
  phoneNumber: string,
  message: string,
): Promise<void> => {
  try {
    // Remove + from phone number, GatewayAPI uses msisdn format
    const msisdn = parseInt(phoneNumber.replace(/\D/g, ''), 10);

    const response = await axios.post(
      'https://gatewayapi.eu/rest/mtsms',
      {
        sender: config.gatewayApiSender,
        message,
        recipients: [{ msisdn }],
      },
      {
        headers: {
          Authorization: `Token ${config.gatewayApiToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status !== 200) {
      throwAppError(
        'sms',
        'Failed to send SMS',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  } catch (error: any) {
    throwAppError(
      'sms',
      `SMS sending failed: ${error?.response?.data?.message || error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
