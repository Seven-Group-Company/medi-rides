
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

// Mock Resend
const mockResend = {
    emails: {
        send: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    },
};

jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => mockResend),
}));

describe('EmailService', () => {
    let service: EmailService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'EMAIL_FROM_ADDRESS') return 'noreply@medirides.com';
                            if (key === 'RESEND_API_KEY') return 're_123';
                            if (key === 'FRONTEND_URL') return 'http://localhost:3000';
                            if (key === 'ADMIN_EMAIL') return 'admin@medirides.com';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        configService = module.get<ConfigService>(ConfigService);

        // Clear mocks
        mockResend.emails.send.mockClear();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendRideBookedEmail', () => {
        it('should send an email to admin', async () => {
            const ride = {
                id: 123,
                passengerName: 'John Doe',
                passengerPhone: '555-0123',
                pickupAddress: '123 Start St',
                dropoffAddress: '456 End Ave',
                scheduledAt: new Date().toISOString(),
                serviceType: 'medical',
                distance: 10.5,
                additionalNotes: 'Test notes',
            };

            await service.sendRideBookedEmail(ride, 'admin@test.com');

            expect(mockResend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
                to: 'admin@test.com',
                subject: expect.stringContaining('New Ride Booking #123'),
                html: expect.stringContaining('John Doe'),
            }));
        });
    });

    describe('sendRideStatusUpdateEmail', () => {
        it('should send confirmed status email', async () => {
            const ride = {
                id: 124,
                scheduledAt: new Date().toISOString(),
                pickupAddress: 'Pickup',
                dropoffAddress: 'Dropoff',
            };

            await service.sendRideStatusUpdateEmail('user@test.com', 'User Name', ride, 'CONFIRMED');

            expect(mockResend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
                to: 'user@test.com',
                subject: expect.stringContaining('Ride Status Update #124 - CONFIRMED'),
                html: expect.stringContaining('Your ride has been confirmed'),
            }));
        });

        it('should send completed status email with invoice link', async () => {
            const ride = {
                id: 124,
                scheduledAt: new Date().toISOString(),
                pickupAddress: 'Pickup',
                dropoffAddress: 'Dropoff',
            };
            const invoiceUrl = 'http://localhost:3000/invoices/999';

            await service.sendRideStatusUpdateEmail('user@test.com', 'User Name', ride, 'COMPLETED', invoiceUrl);

            expect(mockResend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
                to: 'user@test.com',
                subject: expect.stringContaining('Ride Status Update #124 - COMPLETED'),
                html: expect.stringContaining(invoiceUrl),
            }));
        });
    });

    describe('sendDriverAssignedEmail', () => {
        it('should send email to driver', async () => {
            const ride = {
                id: 125,
                passengerName: 'Passenger',
                passengerPhone: '555-5555',
                pickupAddress: 'Pickup',
                dropoffAddress: 'Dropoff',
                scheduledAt: new Date().toISOString(),
            };

            await service.sendDriverAssignedEmail('driver@test.com', 'Driver Name', ride);

            expect(mockResend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
                to: 'driver@test.com',
                subject: expect.stringContaining('New Ride Assignment #125'),
                html: expect.stringContaining('You have been assigned a new ride'),
            }));
        });
    });
});
