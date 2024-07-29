import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('verify_emails')
export class VerifyEmail {
  @PrimaryColumn()
  email: string;

  @Column()
  certification: number;
}
