import { jwtVerify, createRemoteJWKSet } from 'jose';
import throwAppError from './throwAppError';
import { StatusCodes } from 'http-status-codes';
import config from '../config';

const JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export async function verifyAppleToken(idToken: string) {
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: config.appleClientId as string, // ADD THIS
    });

    return {
      appleId: payload.sub as string,
      email: payload.email as string,
      emailVerified:
        payload.email_verified === 'true' || payload.email_verified === true,
      isPrivateEmail: payload.is_private_email === 'true',
    };
  } catch (error) {
    throwAppError(
      'token',
      `Invalid Apple ID token: ${(error as Error).message}`,
      StatusCodes.UNAUTHORIZED,
    );
  }
}

// // import throwAppError from './throwAppError';
// // import jwt, { JwtPayload } from 'jsonwebtoken';
// // import { StatusCodes } from 'http-status-codes';

// // export async function verifyAppleToken(idToken: string) {
// //   try {
// //     const decoded = jwt.decode(idToken, { complete: true });

// //     const payload = decoded?.payload as JwtPayload;

// //     return {
// //       appleId: payload?.sub,
// //       email: payload?.email,
// //       emailVerified: payload?.email_verified,
// //       isPrivateEmail: payload?.is_private_email === 'true',
// //     };
// //   } catch (error) {
// //     throwAppError(
// //       'token',
// //       `Your Apple login token is invalid, ${error}`,
// //       StatusCodes.BAD_REQUEST,
// //     );
// //   }
// // }

// import { jwtVerify, createRemoteJWKSet } from 'jose';
// import throwAppError from './throwAppError';
// import { StatusCodes } from 'http-status-codes';

// const JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

// export async function verifyAppleToken(idToken: string) {
//   try {
//     const { payload } = await jwtVerify(idToken, JWKS, {
//       issuer: 'https://appleid.apple.com',
//     });

//     return {
//       appleId: payload.sub as string,
//       email: payload.email as string,
//       emailVerified:
//         payload.email_verified === 'true' || payload.email_verified === true,
//       isPrivateEmail: payload.is_private_email === 'true',
//     };
//   } catch (error) {
//     throwAppError(
//       'token',
//       `Invalid Apple ID token: ${(error as Error).message}`,
//       StatusCodes.UNAUTHORIZED,
//     );
//   }
// }
