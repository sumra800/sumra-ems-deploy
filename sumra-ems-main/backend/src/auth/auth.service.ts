import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(cnic: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByCnic(cnic);
    console.log('validateUser -> user found:', user ? 'Yes' : 'No');
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      console.log('validateUser -> password match:', isMatch);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: Partial<User>) {
    const payload = { sub: user.id, cnic: user.cnic, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
