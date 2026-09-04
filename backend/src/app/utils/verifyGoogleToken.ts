// /* eslint-disable no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import throwAppError from './throwAppError';
// import { StatusCodes } from 'http-status-codes';
// import { firebaseAuth } from './firebaseAdmin';

// export async function verifyGoogleToken(idToken: string) {
//   try {
//     const decodedToken = await firebaseAuth.verifyIdToken(idToken);

//     return {
//       googleId: decodedToken.uid,
//       email: decodedToken.email,
//       name: decodedToken.name,
//       photoURL: decodedToken.picture,
//       emailVerified: decodedToken.email_verified,
//     };
//   } catch (error: any) {
//     throwAppError(
//       'token',
//       'Firebase token verification failed. Token is invalid, expired, or from a different project.',
//       StatusCodes.UNAUTHORIZED,
//     );
//   }
// }
