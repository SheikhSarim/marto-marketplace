import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from '../../../common/enums/user-roles.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Seller } from '../../sellers/entities/seller.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Name field added
  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  password?: string | null;

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

  // Existing email-verification flag; reused by seller onboarding.
  @Column({ type: 'boolean', default: false })
  is_email_verified!: boolean;

  // Only the SHA-256 hash is stored; the raw verification token is emailed once.
  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    select: false,
  })
  email_verification_token_hash?: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    select: false,
  })
  email_verification_token_expires_at?: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  last_login_at?: Date | null;

  @OneToOne(() => Customer, (customer) => customer.user)
  customer?: Customer | null;

  @OneToOne(() => Seller, (seller) => seller.user)
  seller?: Seller | null;

  // @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  // auditLogs: AuditLog[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
