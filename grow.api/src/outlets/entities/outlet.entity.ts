import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Outlet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    index: number;

    @Column('tinyint', {default: 0})
    status: number;

    @Column()
    name: string;
}
