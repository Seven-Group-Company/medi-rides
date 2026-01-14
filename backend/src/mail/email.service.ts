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

  async sendRideBookedEmail(ride: any, adminEmail: string): Promise<void> {
    try {
      const from = this.configService.get('EMAIL_FROM_ADDRESS');
      const html = this.getRideBookedEmailTemplate(ride);
      const to = adminEmail || this.configService.get('ADMIN_EMAIL') || 'alikamatu14@gmail.com';

      await this.resend.emails.send({
        from,
        to,
        subject: `New Ride Booking #${ride.id} - ${ride.passengerName}`,
        html,
      });

      this.logger.log(`Ride booked email sent to admin: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send ride booked email:`, error);
    }
  }

  async sendRideStatusUpdateEmail(
    userEmail: string,
    userName: string,
    ride: any,
    status: string,
    invoiceUrl?: string
  ): Promise<void> {
    try {
      const from = this.configService.get('EMAIL_FROM_ADDRESS');
      const html = this.getRideStatusUpdateEmailTemplate(userName, ride, status, invoiceUrl);

      await this.resend.emails.send({
        from,
        to: userEmail,
        subject: `Ride Status Update #${ride.id} - ${status}`,
        html,
      });

      this.logger.log(`Ride status update email sent to: ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send ride status update email:`, error);
    }
  }

  async sendDriverAssignedEmail(
    driverEmail: string,
    driverName: string,
    ride: any
  ): Promise<void> {
    try {
      const from = this.configService.get('EMAIL_FROM_ADDRESS');
      const html = this.getDriverAssignedEmailTemplate(driverName, ride);

      await this.resend.emails.send({
        from,
        to: driverEmail,
        subject: `New Ride Assignment #${ride.id}`,
        html,
      });

      this.logger.log(`Driver assigned email sent to: ${driverEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send driver assigned email:`, error);
    }
  }

  async sendDriverDetailsEmail(
    userEmail: string,
    userName: string,
    ride: any,
    driver: any
  ): Promise<void> {
    try {
      const from = this.configService.get('EMAIL_FROM_ADDRESS');
      const html = this.getDriverDetailsEmailTemplate(userName, ride, driver);

      await this.resend.emails.send({
        from,
        to: userEmail,
        subject: `Driver Assigned for Ride #${ride.id}`,
        html,
      });

      this.logger.log(`Driver details email sent to user: ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send driver details email:`, error);
    }
  }

  async sendDriverArrivedEmail(
    userEmail: string,
    userName: string,
    ride: any
  ): Promise<void> {
    this.logger.log(`Preparing to send 'Driver Arrived' email to ${userEmail} for Ride #${ride.id}`);
    try {
      const from = this.configService.get('EMAIL_FROM_ADDRESS');
      const html = this.getDriverArrivedEmailTemplate(userName, ride);

      await this.resend.emails.send({
        from,
        to: userEmail,
        subject: `Driver Arrived - Ride #${ride.id}`,
        html,
      });

      this.logger.log(`Driver arrived email sent to: ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send driver arrived email:`, error);
    }
  }

  async sendRideCompletedAdminEmail(ride: any): Promise<void> {
    this.logger.log(`Preparing to send 'Ride Completed' email to Admin for Ride #${ride.id}`);
    try {
      const from = this.configService.get('EMAIL_FROM_ADDRESS');
      const html = this.getRideCompletedAdminEmailTemplate(ride);
      const to = this.configService.get('ADMIN_EMAIL') || 'alikamatu14@gmail.com';

      await this.resend.emails.send({
        from,
        to,
        subject: `Ride Completed #${ride.id}`,
        html,
      });

      this.logger.log(`Ride completed email sent to admin: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send ride completed admin email:`, error);
    }
  }

  private getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to Compassionate Medi Rides</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with us. To complete your account setup and ensure the security of your information, please verify your email address.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
        </div>
      </body>
      </html>
    `;
  }

  private getRideBookedEmailTemplate(ride: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2563eb;">New Ride Booking #${ride.id}</h2>
          <p><strong>Passenger:</strong> ${ride.passengerName}</p>
          <p><strong>Phone:</strong> ${ride.passengerPhone}</p>
          <p><strong>Pickup:</strong> ${ride.pickupAddress}</p>
          <p><strong>Drop-off:</strong> ${ride.dropoffAddress}</p>
          <p><strong>Date:</strong> ${new Date(ride.scheduledAt).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(ride.scheduledAt).toLocaleTimeString()}</p>
          <p><strong>Service Type:</strong> ${ride.serviceType}</p>
          <p><strong>Distance:</strong> ${ride.distance ? ride.distance.toFixed(1) + ' miles' : 'N/A'}</p>
          <p><strong>Notes:</strong> ${ride.additionalNotes || 'None'}</p>
          
          <div style="margin-top: 20px;">
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard/admin/rides/${ride.id}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Ride Details</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getDriverArrivedEmailTemplate(userName: string, ride: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2563eb;">Driver Has Arrived</h2>
          <p>Hello ${userName},</p>
          <p>Your driver has arrived at the pickup location.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Pickup:</strong> ${ride.pickupAddress}</p>
          </div>
          
           <p>Please meet your driver to begin your ride.</p>
        </div>
      </body>
      </html>
    `;
  }

  private getRideCompletedAdminEmailTemplate(ride: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #10b981;">Ride Completed #${ride.id}</h2>
          <p>A ride has been successfully completed.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Passenger:</strong> ${ride.passengerName}</p>
            <p><strong>Driver:</strong> ${ride.driver?.name || 'N/A'}</p>
            <p><strong>Pickup:</strong> ${ride.pickupAddress}</p>
            <p><strong>Drop-off:</strong> ${ride.dropoffAddress}</p>
            <p><strong>Distance:</strong> ${ride.distance ? ride.distance.toFixed(1) + ' miles' : 'N/A'}</p>
             <p><strong>Final Price:</strong> $${ride.finalPrice || ride.basePrice}</p>
          </div>
          
          <div style="margin-top: 20px;">
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard/admin/rides/${ride.id}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Ride Details</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  // 
  private getRideStatusUpdateEmailTemplate(name: string, ride: any, status: string, invoiceUrl?: string): string {
    let message = '';
    let color = '#2563eb'; // blue

    switch (status) {
      case 'CONFIRMED':
        message = `Your ride has been confirmed at $${ride.finalPrice}. We are locating a driver for you.`;
        color = '#10b981'; // green
        break;
      case 'CANCELLED':
        message = `Your ride has been cancelled.`;
        color = '#ef4444'; // red
        break;
      case 'COMPLETED':
        message = `Your ride has been completed. Thank you for choosing Medirides!`;
        break;
      default:
        message = `The status of your ride has changed to ${status}.`;
    }

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: ${color};">Ride Update: ${status}</h2>
          <p>Hello ${name},</p>
          <p>${message}</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ride ID:</strong> #${ride.id}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(ride.scheduledAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Pickup:</strong> ${ride.pickupAddress}</p>
            <p style="margin: 5px 0;"><strong>Drop-off:</strong> ${ride.dropoffAddress}</p>
          </div>
           ${invoiceUrl ? `<p>You can view your invoice here: <a href="${invoiceUrl}">View Invoice</a></p>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  private getDriverAssignedEmailTemplate(driverName: string, ride: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2563eb;">New Ride Assignment #${ride.id}</h2>
          <p>Hello ${driverName},</p>
          <p>You have been assigned a new ride.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Passenger:</strong> ${ride.passengerName}</p>
            <p><strong>Phone:</strong> ${ride.passengerPhone}</p>
            <p><strong>Pickup:</strong> ${ride.pickupAddress}</p>
            <p><strong>Drop-off:</strong> ${ride.dropoffAddress}</p>
            <p><strong>Time:</strong> ${new Date(ride.scheduledAt).toLocaleString()}</p>
            <p><strong>Notes:</strong> ${ride.additionalNotes || 'None'}</p>
          </div>
          
          <div style="margin-top: 20px;">
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard/driver/rides/${ride.id}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Ride</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getDriverDetailsEmailTemplate(userName: string, ride: any, driver: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #10b981;">Driver Assigned</h2>
          <p>Hello ${userName},</p>
          <p>A driver has been assigned to your ride #${ride.id}.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Driver Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${driver.name}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${driver.phone || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${driver.driverProfile?.vehicleInfo || 'Standard Vehicle'}</p>
            <p style="margin: 5px 0;"><strong>License Plate:</strong> ${driver.driverProfile?.vehicles?.[0]?.licensePlate || 'N/A'}</p>
          </div>
          
          <p>Your driver will arrive at the scheduled pickup time.</p>
        </div>
      </body>
      </html>
    `;
  }
}
