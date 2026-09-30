import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { AppUser } from '../user/entities/app-user.entity.js';
import { UserRegisterDto } from './dto/auth.register.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  private readonly saltRounds = 12;

  async userRegister(dto: UserRegisterDto) {
    //  check if user already exists
    const existingUser = await this.findUserByEmail(dto.userEmail);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordHashed(dto.password);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: unknown) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private findUserByEmail = (email: string) => {
    return this.em.findOne(AppUser, { userEmail: email });
  };

  private passwordHashed = (password: string) => {
    return bcrypt.hash(password, this.saltRounds);
  };
}
