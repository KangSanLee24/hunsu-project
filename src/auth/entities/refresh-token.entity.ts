import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn({ unsigned: true })
  userId: number;

  @Column()
  refreshToken: string;
}
