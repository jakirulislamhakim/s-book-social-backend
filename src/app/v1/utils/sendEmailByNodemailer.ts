import config from '../config';
import nodemailer from 'nodemailer';
import { compileTemplate } from './compileTemplate';

type TSendEmail = {
  to: string;
  subject: string;
  templateName: string;
  emailData: Record<string, unknown>;
  text?: string;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.SENDER_EMAIL,
    pass: config.GMAIL_APP_PASS,
  },
});

export const sendEmailByNodemailer = async ({
  to,
  subject,
  templateName,
  emailData,
  text,
}: TSendEmail): Promise<void> => {
  try {
    const htmlContent = compileTemplate({ templateName, emailData });

    const msg = {
      from: config.SENDER_EMAIL,
      to,
      subject,
      html: htmlContent,
      ...(text && { text }),
    };

    await transporter.sendMail(msg);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    throw new Error('Failed to send email due to unknown error');
  }
};
