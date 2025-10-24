import { CreateSessionDomainDto } from './dto/create-session.domain.dto';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'timestamp' })
  lastActiveDate: Date;

  @Column({ type: 'varchar' })
  deviceId: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  @Column({ type: 'varchar' })
  refreshToken: string;

  @CreateDateColumn({})
  createdAt: Date;

  @UpdateDateColumn({})
  updatedAt: Date;

  static createInstance(dto: CreateSessionDomainDto): Session {
    const session = new Session();
    session.userId = dto.userId;
    session.ip = dto.ip;
    session.title = dto.title;
    session.lastActiveDate = dto.lastActiveDate;
    session.deviceId = dto.deviceId;
    session.expirationDate = dto.expirationDate;
    session.refreshToken = dto.refreshToken;

    return session;
  }

  updateLastActiveDate(newDate?: Date): void {
    // Используем переданную дату или текущее время
    const dateToSet = newDate || new Date();

    // Обновляем дату в ISO формате
    this.lastActiveDate = dateToSet;

    const expirationMs = 20 * 1000;
    this.expirationDate = new Date(dateToSet.getTime() + expirationMs);
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  updateRefreshToken(newRefreshToken: string) {
    this.refreshToken = newRefreshToken;
  }

  // Проверка валидности сессии
  isValid(): boolean {
    return this.deletedAt === null && this.expirationDate > new Date();
  }

  // Получение времени истечения в ISO строке (для обратной совместимости)
  getLastActiveDateISO(): string {
    return this.lastActiveDate.toISOString();
  }
}
