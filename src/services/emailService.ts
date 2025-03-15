import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: config.email.auth,
});

export const sendVerificationEmail = async (email: string, code: string) => {
  await transporter.sendMail({
    from: config.email.auth.user,
    to: email,
    subject: 'Verify Your Email',
    text: `Your verification code is: ${code}`,
  });
};