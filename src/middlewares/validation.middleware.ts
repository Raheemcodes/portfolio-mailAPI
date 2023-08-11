import { body, ValidationChain } from 'express-validator';

// validation
export const validateRequest: ValidationChain[] = [
  body('email', 'INVALID_EMAIL').trim().isEmail(),
  body('name', 'INVALID_NAME').trim().isLength({ min: 3 }),
  body('message', 'INVALID_MSG').trim().isLength({ min: 3 }),
];
