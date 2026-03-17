import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('confirmations')
export class Confirmation {
  @PrimaryColumn({ nullable: false })
  userId: number;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  code: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  codeCreatedAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  codeExpiresAt: Date | null;

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
  recoveryCode: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  recoveryCodeCreatedAt: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  recoveryCodeExpiresAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
