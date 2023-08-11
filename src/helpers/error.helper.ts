import { Result, ValidationError } from 'express-validator';

// Error Interface
export interface CustomError {
  message: string;
  statusCode?: number;
  data?: any;
}

// Error Handling
export const handleError = (
  message: string,
  statusCode?: number,
  data?: string
) => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  return error;
};

export const handleReqError = (errors: Result<ValidationError>) => {
  const [{ msg }] = errors.array();
  return handleError(msg, 422);
};
