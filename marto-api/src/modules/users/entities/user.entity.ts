import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from 'src/common/enums/user-roles.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 255,
    select: false,
    nullable: true,
  })
  password?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'users_role_enum',
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    enumName: 'users_status_enum',
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ default: false })
  is_email_verified!: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  last_login_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
