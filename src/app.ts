import sgmail from '@sendgrid/mail';
import express, { Application, NextFunction, Request, Response } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';

import helmet from 'helmet';

import {
  CustomError,
  generateHTML,
  handleReqError,
  validateRequest,
} from './middleware/mail';

const app: Application = express();
const PORT = process.env.PORT || 3000;
const ACCESS_ORIGIN = <string>process.env.ACCESS_ORIGIN;
const NODEMAIL_GMAIL = process.env.NODEMAIL_GMAIL;
const EMAIL = process.env.EMAIL;

app.use(helmet());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', ACCESS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') res.sendStatus(204);
  else next();
});

app.post(
  '/mail-api',
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      const { email, name, message } = req.body;

      if (!errors.isEmpty()) throw handleReqError(errors);

      res.status(201).send({ message: 'SUCCESS' });

      sgmail.send({
        to: EMAIL,
        from: <string>NODEMAIL_GMAIL,
        subject: 'Message From Your Portfolio',
        html: generateHTML(email, name, message),
      });
    } catch (err) {
      next(err);
    }
  }
);

app.use((error: any, req: Request, res: Response) => {
  console.log(error);
  const { message, statusCode = 500, data }: CustomError = error;

  res.status(statusCode).json({ message, data });
});

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
