import { generateHTML } from './middleware/mail';
import { parentPort, workerData } from 'worker_threads';
import nodemailer from 'nodemailer';

parentPort?.on('message', async (data) => {
  const {
    email,
    name,
    message,
    CLIENT_ID,
    CLIENT_SECRET,
    stringifiedAccess,
    REFRESH_TOKEN,
    EMAIL,
    NODEMAIL_GMAIL,
  } = data;

  const transport: any = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: NODEMAIL_GMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: JSON.parse(stringifiedAccess),
    },
  });

  await transport.sendMail({
    from: NODEMAIL_GMAIL,
    to: EMAIL,
    subject: 'Message From Your Portfolio',
    generateTextFromHTML: true,
    html: generateHTML(email, name, message),
  });

  parentPort?.postMessage('SUCCESS');
});
