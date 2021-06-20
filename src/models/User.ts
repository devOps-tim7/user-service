import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Gender, Role } from '../helpers/shared';

@Entity('nistagram_user')
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  gender: Gender;

  @Column({ type: 'timestamptz' })
  birthDate: Date;

  @Column()
  description: string;

  @Column()
  website: string;

  @Column()
  private: boolean;

  @Column()
  taggable: boolean;

  @Column({ default: false })
  banned: boolean;

  @Column({ default: Role.User })
  role: Role;

  constructor(user?: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
    gender: Gender;
    birthDate: Date;
    description: string;
    website: string;
    private: boolean;
    taggable: boolean;
    role: Role;
  }) {
    super();
    this.username = user?.username;
    this.password = user?.password;
    this.fullName = user?.fullName;
    this.email = user?.email;
    this.phone = user?.phone;
    this.gender = user?.gender;
    this.birthDate = user?.birthDate;
    this.description = user?.description;
    this.website = user?.website;
    this.private = user?.private;
    this.taggable = user?.taggable;
    this.banned = false;
    this.role = user?.role;
  }
}
