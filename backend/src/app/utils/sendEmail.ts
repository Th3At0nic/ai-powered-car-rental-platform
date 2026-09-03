/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import fs from 'fs';
import config from '../config';
import throwAppError from './throwAppError';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

sgMail.setApiKey(config.sendgrid_api_key as string);

export const sendEmailOTP = async (
  email: string,
  otp: string,
  purpose = 'account verification',
  expiresInMinutes = 10,
) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_SENDER as string,
    subject: 'Your One-Time Password (OTP)',
    text: `Use the following OTP to complete your ${purpose}: ${otp}. This code is valid for ${expiresInMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Hello,</p>
        <p>Use the following OTP to complete your <strong>${purpose}</strong>:</p>
        <h2 style="color: #2E86DE;">${otp}</h2>
        <p>This code will expire in <strong>${expiresInMinutes} minutes</strong>.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <br />
        <p>— The Hoppmangolf Team</p>
      </div>
    `,
  };

  try {
    const res = await sgMail.send(msg);
    // console.log(`✅ Email OTP sent to ${email}`);
    if (res[0]?.statusCode !== 202) {
      throwAppError(
        'sendEmailOTP',
        `Failed to send email: ${res[0]?.body}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    } else if (res[0]?.statusCode === 202) {
      return { success: true, message: `OTP sent to ${email}` };
    }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send OTP:', error);
      }

      const errorBody = (error as any).response?.body;

      throwAppError(
        'sendEmailOTP',
        `Failed to send email: ${
          errorBody ? JSON.stringify(errorBody) : (error as Error).message
        }`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send OTP:', error);
      }
      throwAppError(
        'sendEmailOTP',
        'Unknown error occurred while sending email',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
};

//////////////// this below function is for sending sign request email to the signer //////////////////

export const sendSignRequestEmail = async (
  signerEmail: string,
  signerName: string,
  documentName: string,
  signingUrl: string,
  expiresAt: Date,
) => {
  const readableExpiryDate = expiresAt.toLocaleString();

  const msg = {
    to: signerEmail,
    from: process.env.EMAIL_SENDER as string,
    subject: 'You have a document waiting for your signature',
    text: `Hello ${signerName}, you have a document waiting for your signature: ${documentName}. Sign here: ${signingUrl}. This link expires on ${readableExpiryDate}.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
        <p>Hello <strong>${signerName}</strong>,</p>
        <p>You have a document waiting for your signature:</p>
        <div style="background: #f8f9fb; border-left: 4px solid #2E86DE; padding: 16px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Document:</strong> ${documentName}</p>
          <p style="margin: 8px 0 0 0;"><strong>Expires:</strong> ${readableExpiryDate}</p>
        </div>
        <p style="margin: 20px 0;">
          <a href="${signingUrl}" style="display: inline-block; background: #2E86DE; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 600;">
            Review and Sign Document
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #2E86DE;">${signingUrl}</p>
        <p>Please complete the signature before the expiration date above.</p>
        <br />
        <p>— The HOPPMANGOLF Team</p>
      </div>
    `,
  };

  try {
    const res = await sgMail.send(msg);
    if (res[0]?.statusCode !== 202) {
      throwAppError(
        'sendSignRequestEmail',
        `Failed to send email: ${res[0]?.body}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    } else if (res[0]?.statusCode === 202) {
      return {
        success: true,
        message: `Sign request email sent to ${signerEmail}`,
      };
    }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send sign request email:', error);
      }

      const errorBody = (error as any).response?.body;

      const errorMessage = errorBody
        ? JSON.stringify(errorBody)
        : (error as Error).message;

      throwAppError(
        'sendSignRequestEmail',
        `Failed to send email: ${errorMessage}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send sign request email:', error);
      }
      throwAppError(
        'sendSignRequestEmail',
        'Unknown error occurred while sending email',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
};

///////////////////// this below function is for sending email to sender and signer after a successful signature submission //////////////////////
export const sendSignedDocumentEmail = async (
  to: string,
  recipientName: string,
  documentName: string,
  signedPdfPath: string,
  role: string,
) => {
  const pdfBuffer = fs.readFileSync(signedPdfPath);
  const attachmentContent = pdfBuffer.toString('base64');

  const messageText =
    role === 'signer'
      ? `Hello ${recipientName}, you have successfully signed ${documentName}. Please find your signed copy attached.`
      : `${recipientName} has signed ${documentName}. Please find the signed copy attached.`;

  const msg = {
    to,
    from: process.env.EMAIL_SENDER as string,
    subject: `Completed: ${documentName}`,
    text: messageText,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>
          ${
            role === 'signer'
              ? `You have successfully signed <strong>${documentName}</strong>. Please find your signed copy attached.`
              : `<strong>${recipientName}</strong> has signed <strong>${documentName}</strong>. Please find the signed copy attached.`
          }
        </p>
        <p>Thank you for using Hoppmangolf.</p>
        <br />
        <p>— The HOPPMANGOLF Team</p>
      </div>
    `,
    attachments: [
      {
        content: attachmentContent,
        filename: documentName,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  try {
    const res = await sgMail.send(msg);
    if (res[0]?.statusCode !== 202) {
      throwAppError(
        'sendSignedDocumentEmail',
        `Failed to send email: ${res[0]?.body}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    } else if (res[0]?.statusCode === 202) {
      return {
        success: true,
        message: `Signed document email sent to ${to}`,
      };
    }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send signed document email:', error);
      }

      const errorBody = (error as any).response?.body;

      throwAppError(
        'sendSignedDocumentEmail',
        `Failed to send email: ${
          errorBody ? JSON.stringify(errorBody) : (error as Error).message
        }`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send signed document email:', error);
      }
      throwAppError(
        'sendSignedDocumentEmail',
        'Unknown error occurred while sending email',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
};

export const sendPartialSigningNotificationEmail = async (
  to: string,
  senderName: string,
  documentName: string,
  signerName: string,
  signedCount: number,
  totalSigners: number,
) => {
  const msg = {
    to,
    from: process.env.EMAIL_SENDER as string,
    subject: `Update: ${documentName} — ${signedCount} of ${totalSigners} signed`,
    text: `Hello ${senderName}, ${signerName} has signed ${documentName}. ${signedCount} of ${totalSigners} signatures are now complete.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
        <p>Hello <strong>${senderName}</strong>,</p>
        <p><strong>${signerName}</strong> has signed <strong>${documentName}</strong>.</p>
        <p><strong>${signedCount}</strong> of <strong>${totalSigners}</strong> signatures are now complete.</p>
        <br />
        <p>— The HOPPMANGOLF Team</p>
      </div>
    `,
  };

  try {
    const res = await sgMail.send(msg);
    if (res[0]?.statusCode !== 202) {
      throwAppError(
        'sendPartialSigningNotificationEmail',
        `Failed to send email: ${res[0]?.body}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    } else if (res[0]?.statusCode === 202) {
      return {
        success: true,
        message: `Partial signing notification email sent to ${to}`,
      };
    }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send partial signing notification email:', error);
      }

      const errorBody = (error as any).response?.body;

      throwAppError(
        'sendPartialSigningNotificationEmail',
        `Failed to send email: ${
          errorBody ? JSON.stringify(errorBody) : (error as Error).message
        }`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send partial signing notification email:', error);
      }
      throwAppError(
        'sendPartialSigningNotificationEmail',
        'Unknown error occurred while sending email',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
};
