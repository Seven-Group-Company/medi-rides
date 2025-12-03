import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationUrl: string,
  ): Promise<void> {
    try {
      const from = this.configService.get('EMAIL_FROM_ADDRESS');
      const html = this.getVerificationEmailTemplate(name, verificationUrl);

      await this.resend.emails.send({
        from,
        to: email,
        subject: 'Verify Your Email - Compassionate Medi Rides',
        html,
      });

      this.logger.log(`Verification email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email:`, error);
      throw new Error('Failed to send verification email');
    }
  }

    async sendInvoiceEmail(emailData: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }): Promise<void> {
    // Implement your email sending logic here, e.g., using nodemailer or any email provider
    // Example placeholder:
    console.log('Sending email to:', emailData.to);
    // throw new Error('sendEmail not implemented');
  }

  

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    try {
      const from = this.configService.get('EMAIL_FROM_ADDRESS');
      const html = this.getPasswordResetEmailTemplate(name, resetUrl);

      await this.resend.emails.send({
        from,
        to: email,
        subject: 'Reset Your Password - Compassionate Medi Rides',
        html,
      });

      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  private getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>Hello ${name},</h2>
        <p>Thank you for registering with Compassionate Medi Rides. Please verify your email:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>Hello ${name},</h2>
        <p>Click below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
      </body>
      </html>
    `;
  }
}
