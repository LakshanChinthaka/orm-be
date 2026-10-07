import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { AppUser } from '../user/entities/app-user.entity.js';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'node:crypto';
import { PinoLogger } from 'nestjs-pino';
import { SubscriptionService } from '../subscription/subscription.service.js';
import { BusinessService } from '../business/business.service.js';
import { UserService } from '../user/user.service.js';
import { UserRole } from '../permission/entities/user-role.entity.js';
import { PaymentMethod } from '../payment/entities/payment-method.entity.js';
import type { AuthUserPayload } from '../business/business.service.js';
import {
  AuthMeResponseDto,
  UserRegisterDto,
  UserSignInDto,
} from './dtos/index.js';
import type { Request, Response } from 'express';
import { Staff } from '../staff/entities/staff.entity.js';
import { UserSession } from '../user/entities/user-session.entity.js';
import {
  REFRESH_COOKIE_NAME,
  EXPIRES_AT,
  refreshCookieOptions,
} from './config/cookie.config.js';
import { PasswordResetToken } from '../user/entities/password-reset-token.entity.js';

export enum UserType {
  PLATFORM = 'PLATFORM',
  STAFF = 'STAFF',
}

const EXPIRES_IN = '15m';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly logger: PinoLogger,
    private readonly subscriptionService: SubscriptionService,
    private readonly businessService: BusinessService,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  // Register
  async userRegister(dto: UserRegisterDto) {
    const [
      existingUser,
      userStatus,
      ownerRole,
      existingPaymentMethod,
      existingHearAbout,
      existingIndustryType,
    ] = await Promise.all([
      this.findUserByEmail(dto.userEmail),
      this.userService.findActiveUserStatus(),
      // Self-registration always creates a business owner; the role is never client-supplied
      this.em.findOne(UserRole, { roleSlug: 'business_owner' }),
      this.em.findOne(PaymentMethod, { id: dto.paymentMethodId }),
      dto.hearAboutId
        ? this.userService.findHearAboutById(dto.hearAboutId)
        : Promise.resolve(null),
      this.businessService.findIndustryTypeById(dto.industryTypeId),
    ]);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (!userStatus) {
      throw new NotFoundException('Active user status not found');
    }

    if (!ownerRole) {
      throw new NotFoundException('Business owner role not found');
    }

    if (!existingPaymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (dto.hearAboutId && !existingHearAbout?.isActive) {
      throw new NotFoundException('Hear about not found');
    }

    if (!existingIndustryType?.isActive) {
      throw new NotFoundException('Industry type not found');
    }

    const hashedPassword = await this.hashPassword(dto.password);
    const referralCode = this.generateRandomToken().slice(0, 8).toUpperCase();

    const { user, subscription, business } = await this.em.transactional(
      async (em) => {
        const user = em.create(AppUser, {
          userRoleId: ownerRole.id,
          userStatusId: userStatus.id,
          subscriptionPlanId: dto.subscriptionPlanId,
          hearAboutId: dto.hearAboutId ?? null,
          userEmail: dto.userEmail,
          userName: dto.userName,
          userContactNo: dto.contactNo,
          hashPassword: hashedPassword,
          referralCode,
          profileLink: null,
        });

        await em.flush();

        const subscription =
          await this.subscriptionService.createSubscriptionWithEm(em, {
            userId: user.id,
            subscriptionPlanId: dto.subscriptionPlanId,
            subscriptionPlanPriceId: dto.subscriptionPlanPriceId,
            paymentMethodId: dto.paymentMethodId,
          });

        const business = await this.businessService.createBusinessWithEm(em, {
          subscriptionId: subscription.id,
          industryTypeId: dto.industryTypeId,
          businessName: dto.businessName,
          businessContactNo: dto.businessContactNo,
          businessEmail: dto.businessEmail ?? null,
        });

        return { user, subscription, business };
      },
    );

    this.logger.info(`User '${user.id}' registered successfully`);

    return {
      message: 'Registration successful. Please proceed to sign in.',
      user: { id: user.id, displayId: user.displayId, email: user.userEmail },
      business: { id: business.id, displayId: business.displayId },
    };
  }

  //Sign-in
  async signIn(dto: UserSignInDto, ip: string, agent: string, res: Response) {
    let entity: AppUser | Staff | null = null;

    if (dto.userType === UserType.PLATFORM) {
      entity = await this.em.findOne(AppUser, {
        userEmail: dto.username,
        isActive: true,
        deletedAt: null,
      });
    } else {
      entity = await this.em.findOne(Staff, {
        username: dto.username,
        isActive: true,
        deletedAt: null,
      });
    }

    if (
      !entity ||
      !(await this.verifyPassword(entity.hashPassword, dto.password))
    ) {
      throw new UnauthorizedException(
        'Invalid credentials or inactive account',
      );
    }

    const { accessToken, rawRefreshToken } = await this.createSessionTokens(
      entity,
      dto.userType as UserType,
      ip,
      agent,
    );

    // Set httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions);

    return res.status(200).json({
      accessToken,
      userType: dto.userType,
      user: {
        id: entity.id,
        name: 'userName' in entity ? entity.userName : entity.staffName,
      },
    });
  }

  // Current user profile, from the verified access-token payload
  async getMe(payload: AuthUserPayload): Promise<AuthMeResponseDto> {
    const isOwner = payload.userType === UserType.PLATFORM;
    const entity = isOwner
      ? await this.em.findOne(AppUser, {
          id: payload.sub,
          isActive: true,
          deletedAt: null,
        })
      : await this.em.findOne(Staff, {
          id: payload.sub,
          isActive: true,
          deletedAt: null,
        });

    if (!entity) {
      throw new UnauthorizedException('Account not found or inactive');
    }

    const [role, business] = await Promise.all([
      this.em.findOne(UserRole, { id: entity.userRoleId }),
      this.businessService.findOwnBusiness(payload).catch(() => null),
    ]);

    return {
      id: entity.id,
      displayId: entity.displayId,
      userType: isOwner ? 'PLATFORM' : 'STAFF',
      name:
        entity instanceof AppUser ? entity.userName : (entity.staffName ?? ''),
      email:
        entity instanceof AppUser
          ? entity.userEmail
          : (entity.staffEmail ?? null),
      username: entity instanceof Staff ? entity.username : null,
      contactNo:
        entity instanceof AppUser
          ? (entity.userContactNo ?? null)
          : (entity.contactNo ?? null),
      role: role
        ? { id: role.id, slug: role.roleSlug, name: role.userRole }
        : null,
      business: business
        ? {
            id: business.id,
            displayId: business.displayId,
            name: business.businessName,
          }
        : null,
    };
  }

  //refresh token
  async refreshToken(req: Request, res: Response) {
    // @ts-ignore
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

    if (!rawRefreshToken)
      throw new UnauthorizedException('Refresh token cookie missing');

    const incomingHash = this.hashToken(rawRefreshToken);
    const session = await this.em.findOne(UserSession, {
      refreshTokenHash: incomingHash,
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    //TOKEN REUSE DETECTED: An already-revoked token was presented!
    if (session.isRevoked) {
      this.logger.warn(
        `[SECURITY ALERT] Refresh token reuse detected for session ${session.id}! Revoking all user sessions.`,
      );

      // Instantly revoke ALL active sessions for this user account
      await this.revokeAllUserSessions(
        session.userId ?? null,
        session.staffId ?? null,
      );

      res.clearCookie(REFRESH_COOKIE_NAME);

      throw new UnauthorizedException(
        'Security breach detected. All active sessions have been invalidated. Please sign in again.',
      );
    }

    if (new Date() > session.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke old refresh token (Normal token rotation)
    session.isRevoked = true;

    const entity =
      session.userType === UserType.PLATFORM
        ? await this.em.findOne(AppUser, {
            id: session.userId,
            isActive: true,
            deletedAt: null,
          })
        : await this.em.findOne(Staff, {
            id: session.staffId,
            isActive: true,
            deletedAt: null,
          });

    if (!entity)
      throw new UnauthorizedException('Account disabled or terminated');

    const ip = req.ip || '127.0.0.1';
    const agent = req.headers['user-agent'] || 'Unknown';

    const { accessToken, rawRefreshToken: newRawRefreshToken } =
      await this.createSessionTokens(
        entity,
        session.userType as UserType,
        ip,
        agent,
      );

    await this.em.flush();

    // Write updated rotated refresh token to cookie
    res.cookie(REFRESH_COOKIE_NAME, newRawRefreshToken, refreshCookieOptions);

    return res.status(200).json({
      accessToken,
      userType: session.userType,
    });
  }

  //Sign out
  async signOut(req: Request, res: Response) {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (rawRefreshToken) {
      try {
        const incomingHash = this.hashToken(rawRefreshToken);
        await this.em.nativeUpdate(
          UserSession,
          { refreshTokenHash: incomingHash },
          { isRevoked: true },
        );
      } catch (e) {
        // Log DB failure internally, but do NOT fail the sign-out response
        console.error('Failed to revoke session in DB:', e);
      }
    }

    res.clearCookie(REFRESH_COOKIE_NAME, {
      ...refreshCookieOptions,
      maxAge: 0,
    });

    return res.status(200).json({ message: 'Signed out successfully' });
  }

  //Sign-out all session
  async signOutAllSessions(userId: string, userType: UserType, res: Response) {
    const filter =
      userType === UserType.PLATFORM ? { userId } : { staffId: userId };

    try {
      await this.em.nativeUpdate(UserSession, filter, { isRevoked: true });
    } catch (e) {
      // Log DB failure internally, but do NOT fail the sign-out response
      console.error('Failed to revoke session in DB:', e);
    }

    // Clear cookie
    res.clearCookie(REFRESH_COOKIE_NAME, {
      ...refreshCookieOptions,
      maxAge: 0,
    });

    return res
      .status(200)
      .json({ message: 'Signed out from all devices successfully' });
  }

  //Forgot password
  async forgotPassword(username: string, userType: UserType) {
    const entity =
      userType === UserType.PLATFORM
        ? await this.em.findOne(AppUser, {
            userEmail: username,
            deletedAt: null,
          })
        : await this.em.findOne(Staff, {
            username: username,
            deletedAt: null,
          });

    // Always return a neutral success message to prevent account enumeration
    if (!entity) {
      return {
        message: 'If the account exists, a reset link has been dispatched.',
      };
    }

    const rawToken = this.generateRandomToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lifespan

    const resetEntity = this.em.create(PasswordResetToken, {
      userId: userType === UserType.PLATFORM ? entity.id : null,
      staffId: userType === UserType.STAFF ? entity.id : null,
      userType,
      tokenHash,
      expiresAt,
    });

    await this.em.flush();

    // Dispatch rawToken to user via email service...
    // Until email exists, log the link outside production so the flow can be tested.
    if (process.env.NODE_ENV !== 'production') {
      const portalUrl =
        process.env.CUSTOMER_PORTAL_URL ?? 'http://localhost:5173';
      this.logger.warn(
        `[dev only] Password reset link: ${portalUrl}/reset-password?token=${rawToken}`,
      );
    }
    return {
      message: 'If the account exists, a reset link has been dispatched.',
    };
  }

  //Password reset
  async resetPassword(rawToken: string, newPass: string) {
    const tokenHash = this.hashToken(rawToken);
    const resetRecord = await this.em.findOne(PasswordResetToken, {
      tokenHash,
      isUsed: false,
    });

    if (!resetRecord || new Date() > resetRecord.expiresAt) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const newHashPassword = await this.hashPassword(newPass);

    await this.em.transactional(async (em) => {
      resetRecord.isUsed = true;

      if (resetRecord.userType === UserType.PLATFORM) {
        const user = await em.findOne(AppUser, { id: resetRecord.userId });
        if (user) user.hashPassword = newHashPassword;
      } else {
        const staff = await em.findOne(Staff, { id: resetRecord.staffId });
        if (staff) staff.hashPassword = newHashPassword;
      }
    });

    await this.revokeAllUserSessions(
      resetRecord.userId ?? resetRecord.staffId ?? null,
      resetRecord.userType as UserType,
    );

    return { message: 'Password reset successfully. Please sign in.' };
  }

  //Below Helpers
  private async createSessionTokens(
    entity: AppUser | Staff,
    userType: UserType.PLATFORM | UserType.STAFF,
    ip: string,
    agent: string,
  ) {
    const rawRefreshToken = this.generateRandomToken();
    const refreshTokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + EXPIRES_AT);

    const session = this.em.create(UserSession, {
      userId: userType === UserType.PLATFORM ? entity.id : null,
      staffId: userType === UserType.STAFF ? entity.id : null,
      userType,
      refreshTokenHash,
      ipAddress: ip,
      userAgent: agent,
      isRevoked: false,
      expiresAt,
    });

    this.em.persist(session);
    await this.em.flush();

    const payload = {
      sub: entity.id,
      userType,
      userRoleId: entity.userRoleId,
      businessId:
        userType === UserType.STAFF ? (entity as Staff).businessId : null,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: EXPIRES_IN,
    });

    return { accessToken, rawRefreshToken };
  }

  //Emergency revocation method called during breach detection
  private async revokeAllUserSessions(
    userId: string | null,
    staffId: string | null,
  ): Promise<void> {
    if (userId) {
      await this.em.nativeUpdate(
        UserSession,
        { userId, isRevoked: false },
        { isRevoked: true },
      );
    } else if (staffId) {
      await this.em.nativeUpdate(
        UserSession,
        { staffId, isRevoked: false },
        { isRevoked: true },
      );
    }
  }

  private findUserByEmail = (email: string) => {
    return this.em.findOne(AppUser, { userEmail: email });
  };

  private hashPassword = (password: string): Promise<string> => {
    return argon2.hash(password, { type: argon2.argon2id });
  };

  private hashToken = (token: string): string => {
    return createHash('sha256').update(token).digest('hex');
  };

  private verifyPassword = (hash: string, plain: string): Promise<boolean> => {
    return argon2.verify(hash, plain);
  };

  private generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }
}
