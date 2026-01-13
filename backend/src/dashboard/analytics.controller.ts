import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly analytics data' })
  @ApiQuery({ name: 'weeks', required: false, type: Number, description: 'Number of weeks to look back' })
  @ApiResponse({ status: 200, description: 'Weekly analytics retrieved successfully' })
  async getWeeklyAnalytics(@Query('weeks', new ParseIntPipe({ optional: true })) weeks: number = 4) {
    const data = await this.analyticsService.getWeeklyAnalytics(weeks);

    return {
      success: true,
      data,
    };
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly analytics data' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Number of months to look back' })
  @ApiResponse({ status: 200, description: 'Monthly analytics retrieved successfully' })
  async getMonthlyAnalytics(@Query('months', new ParseIntPipe({ optional: true })) months: number = 6) {
    const data = await this.analyticsService.getMonthlyAnalytics(months);

    return {
      success: true,
      data,
    };
  }

  @Get('service-breakdown')
  @ApiOperation({ summary: 'Get service breakdown analytics' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Period: week, month, quarter, year' })
  @ApiResponse({ status: 200, description: 'Service breakdown retrieved successfully' })
  async getServiceBreakdown(@Query('period') period: string = 'month') {
    const data = await this.analyticsService.getServiceBreakdown(period);

    return {
      success: true,
      data,
    };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Period: week, month, quarter, year' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  async getRevenueAnalytics(@Query('period') period: string = 'month') {
    const data = await this.analyticsService.getRevenueAnalytics(period);

    return {
      success: true,
      data,
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get comprehensive analytics summary' })
  @ApiResponse({ status: 200, description: 'Analytics summary retrieved successfully' })
  async getAnalyticsSummary() {
    const data = await this.analyticsService.getAnalyticsSummary();

    return {
      success: true,
      data,
    };
  }
}