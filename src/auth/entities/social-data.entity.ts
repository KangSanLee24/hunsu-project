import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('social_datas')
export class SocialData {
  @PrimaryColumn({ unsigned: true })
  userId: number;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  certification: number;
}
