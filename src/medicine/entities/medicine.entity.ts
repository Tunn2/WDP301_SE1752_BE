import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Medicine {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  manufacturer: string;
  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column()
  type: string;
}
