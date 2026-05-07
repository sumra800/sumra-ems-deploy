import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ConstituenciesService } from './constituencies.service';
import { CreateConstituencyDto } from './dto/create-constituency.dto';
import { UpdateConstituencyDto } from './dto/update-constituency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('constituencies')
export class ConstituenciesController {
  constructor(private readonly constituenciesService: ConstituenciesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createConstituencyDto: CreateConstituencyDto) {
    return this.constituenciesService.create(createConstituencyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.constituenciesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constituenciesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConstituencyDto: UpdateConstituencyDto) {
    return this.constituenciesService.update(id, updateConstituencyDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constituenciesService.remove(id);
  }
}
