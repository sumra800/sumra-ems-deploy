import { Controller, Post, Body, Res, Req, UseGuards, UnauthorizedException, Get, HttpCode, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private readonly authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  } as const;

  @Post('register')
  @UseInterceptors(FileInterceptor('photo'))
  async register(
    @Body() createUserDto: RegisterDto,
    @UploadedFile() photo: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const uploadResult = photo
      ? await this.cloudinaryService.uploadImage(photo.buffer, photo.mimetype)
      : undefined;
    const user = await this.usersService.create({
      ...createUserDto,
      photoUrl: uploadResult?.secure_url,
    });
    const { access_token } = await this.authService.login(user);
    
    res.cookie('Authentication', access_token, this.authCookieOptions);

    const { password, ...result } = user;
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto.cnic, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token } = await this.authService.login(user);
    
    res.cookie('Authentication', access_token, this.authCookieOptions);

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }
}
