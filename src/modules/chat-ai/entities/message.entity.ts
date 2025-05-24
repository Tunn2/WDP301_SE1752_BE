import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'text' })
  content: string;
  @ManyToOne(() => User, (user) => user.messages, { nullable: true })
  user: User;

  @Column()
  from: string;

  @Column({
    type: 'timestamp',
  })
  date: Date;
}
