// entities/user.entity.ts
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
  })
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
  email: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}

//   setConfirmationCode(code: string): void {
//     if (!code || typeof code !== 'string') {
//       throw new Error('Confirmation code must be a non-empty string');
//     }
//
//     this.confirmationCode = code;
//     this.confirmationCodeCreatedAt = new Date();
//     this.confirmationCodeExpiresAt = new Date();
//     this.confirmationCodeExpiresAt.setDate(
//       this.confirmationCodeExpiresAt.getDate() + 2,
//     );
//     this.isEmailConfirmed = false;
//   }
//
//   setRecoveryCode(code: string): void {
//     if (!code || typeof code !== 'string') {
//       throw new Error('Confirmation code must be a non-empty string');
//     }
//
//     this.recoveryCode = code;
//     this.recoveryCodeCreatedAt = new Date();
//     this.recoveryCodeExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
//   }
//
//   confirmEmail(): void {
//     this.isEmailConfirmed = true;
//     this.confirmationCode = null;
//     this.confirmationCodeCreatedAt = null;
//     this.confirmationCodeExpiresAt = null;
//   }
//
//   update(dto: UpdateUserDto): void {
//     if (dto.email && dto.email !== this.email) {
//       this.isEmailConfirmed = false;
//       this.email = dto.email;
//     }
//   }
//
//   setNewPasswordHash(newPasswordHash: string): void {
//     this.passwordHash = newPasswordHash;
//   }
// }
