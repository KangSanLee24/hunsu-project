import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('verify_passwords')
export class VerifyPassword {
    @PrimaryColumn()
    email: string;

    @Column()
    certification: number;

    @Column()
    isCertified: boolean;
}
