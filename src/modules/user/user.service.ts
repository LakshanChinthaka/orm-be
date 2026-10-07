import { ConflictException, Injectable } from '@nestjs/common';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/postgresql';
import { UserStatus } from './entities/user-status.entity.js';
import { HearAbout } from './entities/hear-about.entity.js';
import { PinoLogger } from 'nestjs-pino';
import { AdminUserStatusRequestDto } from './dtos/admin/admin-user-status-request.dto.js';
import { AdminUserStatusResponseDto } from './dtos/admin/admin-user-status-response.dto.js';
import { AdminHearAboutRequestDto } from './dtos/admin/hear-about-request.dto.js';
import { AdminHearAboutFilterDto, HearAboutResponseDto } from './dtos/index.js';
import { AppUser } from './entities/app-user.entity.js';

@Injectable()
export class UserService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserService.name);
  }

  // admin
  async createUserStatus(
    dto: AdminUserStatusRequestDto,
  ): Promise<AdminUserStatusResponseDto> {
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

  // admin
  async findAllUserStatus(): Promise<AdminUserStatusResponseDto[]> {
    return this.em.findAll(UserStatus);
  }

  //hear about
  async createHearAbout(
    dto: AdminHearAboutRequestDto,
  ): Promise<HearAboutResponseDto> {
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

  //user
  async customerFindAllHearAbout(): Promise<HearAboutResponseDto[]> {
    return this.em.findAll(HearAbout, {
      where: {
        isActive: true,
      },
    });
  }

  //admin
  async adminFindAllHearAbout(
    filters: AdminHearAboutFilterDto,
  ): Promise<HearAboutResponseDto[]> {
    return this.em.findAll(HearAbout, {
      where: filters.status !== undefined ? { isActive: filters.status } : {},
    });
  }

  public findActiveUserStatus = () => {
    return this.em.findOne(UserStatus, { userStatus: 'active' });
  };

  public findHearAboutById = (id: string) => {
    return this.em.findOne(HearAbout, { id: id });
  };
}
