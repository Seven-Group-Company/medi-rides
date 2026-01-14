import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';

@Global() // Making it global so we don't have to import it everywhere, or we can just import it where needed. Plan said "Configure Email Module". Global is easier but maybe specific is better. Let's go with specific import to follow best practices, or Global for utility. Given I'm editing multiple modules, Global saves time but explicit is safer. I'll stick to non-global first, or Global if used in many places. The user prompt implies "backend" so global might be fine. But let's do standard module first.
@Module({
    imports: [ConfigModule], // EmailService uses ConfigService
    providers: [EmailService],
    exports: [EmailService],
})
export class MailModule { }
