import sgMail from '@sendgrid/mail';
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
const { ACCESS_ORIGIN, NODEMAIL_GMAIL, EMAIL, SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY!);

app.use(helmet());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', ACCESS_ORIGIN!);
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

      const response = await sgMail.send({
        to: EMAIL,
        from: NODEMAIL_GMAIL!,
        subject: 'Message From Your Portfolio',
        html: generateHTML(email, name, message),
      });

      console.log('email sent successfully!');
    } catch (err) {
      next(err);
    }
  }
);

app.use((error: any, req: Request, res: Response) => {
  const { message, statusCode = 500, data }: CustomError = error;
  console.log(message, data);

  res.status(statusCode).json({ message, data });
});

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
