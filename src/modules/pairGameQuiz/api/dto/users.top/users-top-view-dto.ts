// dto/users-top-view.dto.ts
export class UserTopItemDto {
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

export class UsersTopViewDto {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserTopItemDto[];
}
