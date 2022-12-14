import { NextFunction } from 'connect';
import express, { Application, Request, Response } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
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
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const client: OAuth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
client.setCredentials({ refresh_token: REFRESH_TOKEN });

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
      const accessToken: GetAccessTokenResponse = await client.getAccessToken();

      const { email, name, message } = req.body;

      if (!errors.isEmpty()) throw handleReqError(errors);

      const transport: any = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: NODEMAIL_GMAIL,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken as string,
        },
      });

      await transport.sendMail({
        from: NODEMAIL_GMAIL,
        to: EMAIL,
        subject: 'Message From Your Portfolio',
        generateTextFromHTML: true,
        html: generateHTML(email, name, message),
      });

      res.status(201).send({ message: 'SUCCESS' });
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
