import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ example: 'reset-token-123' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ example: 'newSecurePassword123' })
    @IsString()
    @MinLength(6)
    newPassword: string;
}
