// entities/user.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreateUserDomainDto } from './create-user.domain.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  @Index('IDX_USER_LOGIN', { unique: true })
  login: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @Index('IDX_USER_EMAIL', { unique: true })
  email: string;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isEmailConfirmed: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  confirmationCode: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  confirmationCodeCreatedAt: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  confirmationCodeExpiresAt: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  recoveryCode: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  recoveryCodeCreatedAt: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  recoveryCodeExpiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Статический метод создания инстанса
  static createInstance(dto: CreateUserDomainDto): User {
    const user = new User();
    user.login = dto.login;
    user.passwordHash = dto.passwordHash;
    user.email = dto.email;
    user.confirmationCode = dto.confirmationCode;
    user.confirmationCodeCreatedAt = new Date();
    user.confirmationCodeExpiresAt = new Date();
    user.confirmationCodeExpiresAt.setDate(
      user.confirmationCodeExpiresAt.getDate() + 2,
    );
    user.isEmailConfirmed = false;

    return user;
  }

  // Методы экземпляра
  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  setConfirmationCode(code: string): void {
    if (!code || typeof code !== 'string') {
      throw new Error('Confirmation code must be a non-empty string');
    }

    this.confirmationCode = code;
    this.confirmationCodeCreatedAt = new Date();
    this.confirmationCodeExpiresAt = new Date();
    this.confirmationCodeExpiresAt.setDate(
      this.confirmationCodeExpiresAt.getDate() + 2,
    );
    this.isEmailConfirmed = false;
  }

  setRecoveryCode(code: string): void {
    if (!code || typeof code !== 'string') {
      throw new Error('Confirmation code must be a non-empty string');
    }

    this.recoveryCode = code;
    this.recoveryCodeCreatedAt = new Date();
    this.recoveryCodeExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  }

  confirmEmail(): void {
    this.isEmailConfirmed = true;
    this.confirmationCode = null;
    this.confirmationCodeCreatedAt = null;
    this.confirmationCodeExpiresAt = null;
  }

  update(dto: UpdateUserDto): void {
    if (dto.email && dto.email !== this.email) {
      this.isEmailConfirmed = false;
      this.email = dto.email;
    }
  }

  setNewPasswordHash(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
  }
}
