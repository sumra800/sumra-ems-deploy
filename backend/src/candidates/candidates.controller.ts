import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { assertAllowedImageMime } from '../cloudinary/allowed-image-upload';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
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
  async create(@Body() createCandidateDto: CreateCandidateDto, @UploadedFile() symbol: any) {
    if (symbol) {
      assertAllowedImageMime(symbol.mimetype, 'Candidate symbol');
    }
    const uploadResult = symbol
      ? await this.cloudinaryService.uploadImage(symbol.buffer, symbol.mimetype)
      : undefined;
    return this.candidatesService.create({
      ...createCandidateDto,
      photoUrl: uploadResult?.secure_url ?? createCandidateDto.photoUrl,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.candidatesService.findAllForUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('symbol'))
  async update(@Param('id') id: string, @Body() updateCandidateDto: UpdateCandidateDto, @UploadedFile() symbol: any) {
    if (symbol) {
      assertAllowedImageMime(symbol.mimetype, 'Candidate symbol');
    }

    // Get current candidate to check for existing image
    const currentCandidate = await this.candidatesService.findOne(id);

    // If uploading new image and there's an existing one, delete the old one
    if (symbol && currentCandidate.photoUrl) {
      const publicId = this.extractPublicIdFromUrl(currentCandidate.photoUrl);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    const uploadResult = symbol
      ? await this.cloudinaryService.uploadImage(symbol.buffer, symbol.mimetype)
      : undefined;
    return this.candidatesService.update(id, {
      ...updateCandidateDto,
      photoUrl: uploadResult?.secure_url ?? updateCandidateDto.photoUrl,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Get candidate to check for image
    const candidate = await this.candidatesService.findOne(id);

    // Delete image from Cloudinary if it exists
    if (candidate.photoUrl) {
      const publicId = this.extractPublicIdFromUrl(candidate.photoUrl);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    return this.candidatesService.remove(id);
  }
}
