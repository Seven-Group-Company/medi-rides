import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller";
import { RidesService } from "../rides/rides.service";
import { PrismaService } from "prisma/prisma.service";

@Module({
    controllers: [PublicController],
    providers: [RidesService, PrismaService],
})
export class PublicModule { }