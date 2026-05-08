import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PartiesService } from './parties.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('parties')
export class PartiesController {
  constructor(
    private readonly partiesService: PartiesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('symbol'))
  async create(@Body() createPartyDto: CreatePartyDto, @UploadedFile() symbol: any) {
    const uploadResult = symbol
      ? await this.cloudinaryService.uploadImage(symbol.buffer, symbol.mimetype)
      : undefined;
    return this.partiesService.create({
      ...createPartyDto,
      logoUrl: uploadResult?.secure_url ?? createPartyDto.logoUrl,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.partiesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('symbol'))
  async update(@Param('id') id: string, @Body() updatePartyDto: UpdatePartyDto, @UploadedFile() symbol: any) {
    const uploadResult = symbol
      ? await this.cloudinaryService.uploadImage(symbol.buffer, symbol.mimetype)
      : undefined;
    return this.partiesService.update(id, {
      ...updatePartyDto,
      logoUrl: uploadResult?.secure_url ?? updatePartyDto.logoUrl,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partiesService.remove(id);
  }
}
