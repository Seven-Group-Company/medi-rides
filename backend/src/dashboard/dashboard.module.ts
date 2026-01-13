import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "prisma/prisma.service";

@Module({
    imports: [AuthModule],
    controllers: [DashboardController],
    providers: [DashboardService, PrismaService],
    exports: [DashboardService],
})
export class DashboardModule { }