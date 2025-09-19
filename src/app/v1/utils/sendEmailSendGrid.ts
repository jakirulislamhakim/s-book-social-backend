import config from '../config';
import { compileTemplate } from './compileTemplate';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(config.SENDGRID_API_KEY);

type TSendEmail = {
  to: string;
  subject: string;
  templateName: string;
  emailData: Record<string, unknown>;
};

/**
 * Sends an email using SendGrid with a compiled HTML template.
 *
 * @async
 * @function sendEmailBySendGrid
 * @param {Object} params - Email details.
 * @param {string} params.to - The recipient's email address.
 * @param {string} params.subject - The subject line of the email.
 * @param {string} params.templateName - The name of the email template to use.
 * @param {Record<string, unknown>} params.emailData - Key-value data to fill in the template placeholders.
 * @throws {Error} If email sending fails, an error is logged and thrown.
 * @returns {Promise<void>} Resolves when the email is successfully sent.
 *
 * @example
 * // Example usage:
 * await sendEmailBySendGrid({
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   templateName: "welcomeTemplate", // its come from { v1/views/welcomeTemplate.hbs }
 *   emailData: { firstName: "John" }
 * });
 */

export const sendEmailBySendGrid = async ({
  to,
  subject,
  templateName,
  emailData,
}: TSendEmail): Promise<void> => {
  try {
    const htmlContent = compileTemplate({ templateName, emailData });

    const msg = {
      to,
      from: config.SENDER_EMAIL,
      subject,
      html: htmlContent,
      text: `Hi Hakim,\nPlease verify your email using this link: {{verificationLink}}\nIf you didn’t request this, you can ignore this email.`,
    };

    await sgMail.send(msg);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    throw new Error('Failed to send email due to unknown error');
  }
};
