import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DocumentTrackingService } from '../document-tracking.service';

@Injectable()
export class DocumentExpiryTask {
  constructor(private readonly documentTrackingService: DocumentTrackingService) {}

  // Run every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateDocumentStatuses() {
    console.log('Running document status update task...');
    await this.documentTrackingService.updateExpiredDocuments();
  }

  // Run every day at 9 AM
  @Cron('0 9 * * *')
  async sendScheduledReminders() {
    console.log('Running scheduled reminders task...');
    await this.documentTrackingService.sendScheduledReminders();
  }
}