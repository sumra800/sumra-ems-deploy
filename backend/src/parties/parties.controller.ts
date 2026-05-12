import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { assertAllowedImageMime } from '../cloudinary/allowed-image-upload';
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

  private extractPublicIdFromUrl(url: string): string | null {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/);
    return match ? match[1] : null;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('symbol'))
  async create(@Body() createPartyDto: CreatePartyDto, @UploadedFile() symbol: any) {
    if (symbol) {
      assertAllowedImageMime(symbol.mimetype, 'Party symbol');
    }
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
    if (symbol) {
      assertAllowedImageMime(symbol.mimetype, 'Party symbol');
    }

    // Get current party to check for existing image
    const currentParty = await this.partiesService.findOne(id);

    // If uploading new image and there's an existing one, delete the old one
    if (symbol && currentParty.logoUrl) {
      const publicId = this.extractPublicIdFromUrl(currentParty.logoUrl);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

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
  async remove(@Param('id') id: string) {
    // Get party to check for image
    const party = await this.partiesService.findOne(id);

    // Delete image from Cloudinary if it exists
    if (party.logoUrl) {
      const publicId = this.extractPublicIdFromUrl(party.logoUrl);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    return this.partiesService.remove(id);
  }
}
