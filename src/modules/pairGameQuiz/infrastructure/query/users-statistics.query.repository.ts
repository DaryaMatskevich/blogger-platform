import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatistics } from '../../domain/user-statistics.entity';
import { User } from '../../../../modules/user-accounts/users/domain/user.entity';

export interface LeaderboardQueryParams {
  sort: Array<{ field: string; order: 'ASC' | 'DESC' }>; // переименовано с sortBy
  skip: number;
  take: number;
}

export interface LeaderboardItem {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: {
    id: string;
    login: string;
  };
}

export interface LeaderboardResult {
  items: LeaderboardItem[];
  totalCount: number;
}

@Injectable()
export class UsersStatisticsQueryRepository {
  constructor(
    @InjectRepository(UserStatistics)
    private usersStatisticsQueryRepository: Repository<UserStatistics>,
  ) {}

  async getLeaderboard(
    params: LeaderboardQueryParams,
  ): Promise<LeaderboardResult> {
    const { sort, skip, take } = params;

    const qb = this.usersStatisticsQueryRepository
      .createQueryBuilder('stats')
      .leftJoin(User, 'user', 'user.id = stats.userId')
      .select([
        'stats.sumScore AS "sumScore"',
        'stats.avgScores AS "avgScores"',
        'stats.gamesCount AS "gamesCount"',
        'stats.winsCount AS "winsCount"',
        'stats.lossesCount AS "lossesCount"',
        'stats.drawsCount AS "drawsCount"',
        'user.id AS "player_id"',
        'user.login AS "player_login"',
      ]);

    // Допустимые поля для сортировки
    const allowedFields = [
      'sumScore',
      'avgScores',
      'gamesCount',
      'winsCount',
      'lossesCount',
      'drawsCount',
    ];

    // Применяем сортировку
    if (sort.length === 0) {
      qb.addOrderBy('stats.sumScore', 'DESC');
    } else {
      for (const sortOption of sort) {
        if (allowedFields.includes(sortOption.field)) {
          qb.addOrderBy(`stats.${sortOption.field}`, sortOption.order);
        }
      }
    }

    // Пагинация
    qb.offset(skip).limit(take);

    // Получаем данные и общее количество (с учётом возможных WHERE условий)
    const [rawResults, totalCount] = await Promise.all([
      qb.getRawMany(),
      qb.clone().offset(undefined).limit(undefined).getCount(), // правильно считаем количество записей без пагинации
    ]);

    const items: LeaderboardItem[] = rawResults.map((row) => ({
      sumScore: parseFloat(row.sumScore) || 0,
      avgScores: parseFloat(row.avgScores) || 0,
      gamesCount: parseInt(row.gamesCount, 10) || 0,
      winsCount: parseInt(row.winsCount, 10) || 0,
      lossesCount: parseInt(row.lossesCount, 10) || 0,
      drawsCount: parseInt(row.drawsCount, 10) || 0,
      player: {
        id: row.player_id?.toString() ?? '',
        login: row.player_login ?? 'unknown',
      },
    }));

    return { items, totalCount };
  }
  async findByUserId(userId: number): Promise<UserStatistics | null> {
    return this.usersStatisticsQueryRepository.findOne({ where: { userId } });
  }
}
