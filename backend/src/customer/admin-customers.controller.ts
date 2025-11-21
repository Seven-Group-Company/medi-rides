import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AdminCustomersService } from './admin-customers.service';

@ApiTags('Admin Customers')
@Controller('admin/customers') // Make sure @Controller() decorator is present
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminCustomersController {
  constructor(private readonly adminCustomersService: AdminCustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async getAllCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page || '1') || 1;
    const limitNum = parseInt(limit || '10') || 10;
    
    const result = await this.adminCustomersService.getAllCustomers(
      pageNum,
      limitNum,
      status,
      search
    );
    
    return {
      success: true,
      ...result,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update customer active status' })
  @ApiResponse({ status: 200, description: 'Customer status updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateCustomerStatus(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() body: { isActive: boolean },
  ) {
    const customer = await this.adminCustomersService.updateCustomerStatus(
      customerId,
      body.isActive
    );
    
    return {
      success: true,
      message: `Customer ${body.isActive ? 'activated' : 'deactivated'} successfully`,
      data: customer,
    };
  }
}