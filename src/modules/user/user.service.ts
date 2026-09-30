import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/postgresql';
import { UserStatus } from './entities/user-status.entity.js';
import { HearAbout } from './entities/hear-about.entity.js';
import { UserStatusRequestDto } from './dto/user-status-request.dto.js';
import { UserStatusResponseDto } from './dto/user-status-response.dto.js';
import { HearAboutRequestDto } from './dto/hear-about-request.dto.js';
import { HearAboutResponseDto } from './dto/hear-about-response.dto.js';
import { PinoLogger } from 'nestjs-pino';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserService.name);
  }

  // user status
  async createUserStatus(
    dto: UserStatusRequestDto,
  ): Promise<UserStatusRequestDto> {
    try {
      const newStatus = this.em.create(UserStatus, {
        userStatus: dto.userStatus,
        isActive: dto.isActive,
      });
      await this.em.flush();

      this.logger.info('User status created successfully');
      return newStatus;
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          `User status ${dto.userStatus} already exists`,
        );
      }
      throw e;
    }
  }

  // user status
  async findAllUserStatus(): Promise<UserStatusResponseDto[]> {
    return this.em.findAll(UserStatus);
  }

  //hear about
  async createHearAbout(
    dto: HearAboutRequestDto,
  ): Promise<HearAboutRequestDto> {
    try {
      const newStatus = this.em.create(HearAbout, {
        hearAboutName: dto.hearAboutName,
        isActive: dto.isActive,
      });
      await this.em.flush();

      this.logger.info('Hear about created successfully');
      return newStatus;
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          `Hear about '${dto.hearAboutName}' already exists`,
        );
      }
      throw e;
    }
  }

  //hear about
  async findAllHearAbout(): Promise<HearAboutResponseDto[]> {
    return this.em.findAll(HearAbout);
  }

  // Number of random bytes (4 bytes = 8 hex characters)
  private generateReferralCode = (length = 4) => {
    return randomBytes(length).toLocaleString('hex').toLocaleLowerCase();
  };
}
