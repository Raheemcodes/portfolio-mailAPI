import { NextFunction } from 'connect';
import express, { Application, Request, Response } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import {
  CustomError,
  RefreshToken_,
  generateHTML,
  handleReqError,
  validateRequest,
} from './middleware/mail';
import fs from 'fs';
import path from 'path';

const {
  PORT,
  ACCESS_ORIGIN,
  NODEMAIL_GMAIL,
  EMAIL,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  GMAIL_SCOPES,
} = process.env;

const app: Application = express();

const client: OAuth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
let REFRESH_TOKEN: string;

fs.readFile(
  path.join(process.cwd(), 'data', 'token.json'),
  (err, data: any) => {
    if (err) console.log('no token');
    else {
      const { refreshToken }: RefreshToken_ = JSON.parse(data);
      REFRESH_TOKEN = refreshToken;
      console.log('Token fetched :)');
    }
  }
);

app.use(helmet());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', ACCESS_ORIGIN!);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') res.sendStatus(204);
  else next();
});

app.set('view engine', 'html');

app.use('/generate-authcode', (req: Request, res: Response) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [GMAIL_SCOPES!],
  });

  res.redirect(url);
});

app.use('/oauthcallback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const { tokens } = await client.getToken(code as string);
    REFRESH_TOKEN = tokens.refresh_token!;
    const data = JSON.stringify({ refreshToken: REFRESH_TOKEN });

    fs.writeFile(
      path.join(process.cwd(), 'data', 'token.json'),
      data,
      (err) => {
        if (err) throw err;
        console.log('Token stored :)');
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post(
  '/mail-api',
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Result<ValidationError> = validationResult(req);
      client.setCredentials({ refresh_token: REFRESH_TOKEN });
      const { token }: GetAccessTokenResponse = await client.getAccessToken();

      const { email, name, message } = req.body;

      if (!errors.isEmpty()) throw handleReqError(errors);

      const transport: any = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: NODEMAIL_GMAIL,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: token!,
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

app.listen(PORT || 3000, () => {
  console.log(`Server running at port: ${PORT}`);
});
