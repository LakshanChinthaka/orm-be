import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { AppUser } from '../user/entities/app-user.entity.js';
import { UserRegisterDto } from './dtos/auth.register.dto.js';
import * as bcrypt from 'bcrypt';
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly subscriptionService: SubscriptionPlanService,
  ) {}

  private readonly SALT_ROUNDS = 12;

  async userRegister(dto: UserRegisterDto) {
    //  check if user already exists
    const existingUser = await this.findUserByEmail(dto.userEmail);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordHashed(dto.password);

    console.log('Hash password', hashedPassword);
    console.log('UserRegisterDto', dto);
  }

  private findUserByEmail = (email: string) => {
    return this.em.findOne(AppUser, { userEmail: email });
  };

  private passwordHashed = (password: string) => {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  };
}
