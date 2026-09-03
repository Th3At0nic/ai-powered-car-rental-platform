/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSource, TGenericErrorResponse } from '../interface/error';

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const statusCode = 409;

  // Extract the duplicate field name from the error keyValue object
  // MongoDB provides this directly — no regex needed
  const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
  const duplicateValue = err.keyValue?.[duplicateField] || 'unknown';

  const errorSource: TErrorSource = [
    {
      path: duplicateField,
      message: `${duplicateValue} already exists. Please use a different value.`,
    },
  ];

  return {
    statusCode,
    message: 'Duplicate Entry Error!',
    errorSource,
  };
};
