import sgMail from '@sendgrid/mail';
import express, { Application, NextFunction, Request, Response } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import helmet from 'helmet';
import compression from 'compression';

import { CustomError, handleReqError } from './helpers/error.helper';
import generateHTML from './helpers/mail.helper';
import { validateRequest } from './middlewares/validation.middleware';

const { PORT, ACCESS_ORIGIN, SENDER_EMAIL, SENDGRID_API_KEY, EMAIL } =
  process.env;

const app: Application = express();

app.use(helmet({ referrerPolicy: false }));
app.use(compression());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header({
    'Access-Control-Allow-Origin': ACCESS_ORIGIN,
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  next();
});

app.post(
  '/mail-api',
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      const { email, name, message } = req.body;

      if (!errors.isEmpty()) throw handleReqError(errors);

      sgMail.setApiKey(SENDGRID_API_KEY!);
      await sgMail.send({
        from: SENDER_EMAIL!,
        to: EMAIL,
        subject: 'Message From Your Portfolio',
        html: generateHTML(email, name, message),
      });

      res.status(201).send({ message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  }
);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const { message, statusCode = 500, data }: CustomError = error;

  res.status(statusCode).json({ message, data });
  console.log(error);
});

app.listen(PORT || 3000, () => {
  console.log(`Server running at port: ${PORT}`);
});

export default app;
